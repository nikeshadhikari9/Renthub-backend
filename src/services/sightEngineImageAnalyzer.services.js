const axios = require('axios');
const { SIGHT_API_SECRET, SIGHT_API_USER } = require("../config/env");

// Risk thresholds configuration
const RISK_THRESHOLDS = {
    nudity: 0.7,         // Sum of suggestive probabilities
    weapon: 0.5,         // Firearms/knives
    violence: 0.6,       // Physical violence
    gore: 0.4,           // Blood/injuries
    drug: 0.3,           // Recreational drugs
    alcohol: 0.8         // Alcohol content
};

const analyzeImage = async () => {
    try {
        const response = await axios.get('https://api.sightengine.com/1.0/check.json', {
            params: {
                url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fas2.ftcdn.net%2Fv2%2Fjpg%2F05%2F05%2F62%2F03%2F1000_F_505620343_H6ZFoQi4bqfTa211Xc8Xl0kknYgvbz83.jpg&f=1&nofb=1&ipt=fb6ef9ffd3d73bed2a8b6897bbac64698d3992b20bd19e0517383e3b3435cd22",
                models: 'nudity-2.1,weapon,alcohol,recreational_drug,medical,faces,text-content,face-attributes,gore-2.0,violence',
                api_user: SIGHT_API_USER,
                api_secret: SIGHT_API_SECRET,
            }
        });

        const analysis = response.data;

        // Calculate risk scores
        const risks = {
            nudity: analysis.nudity.sexual_activity +
                analysis.nudity.sexual_display +
                analysis.nudity.erotica,
            weapon: analysis.weapon.classes.firearm +
                analysis.weapon.classes.knife,
            violence: analysis.violence.prob,
            gore: analysis.gore.prob,
            drug: analysis.recreational_drug.prob,
            alcohol: analysis.alcohol.prob
        };

        // Check against thresholds
        const shouldQuarantine = Object.keys(risks).some(
            category => risks[category] > RISK_THRESHOLDS[category]
        );

        // Get specific reasons for quarantine
        const quarantineReasons = Object.entries(risks)
            .filter(([category, score]) => score > RISK_THRESHOLDS[category])
            .map(([category]) => category);
        const status = shouldQuarantine ? 'quarantined' : 'approved';
        console.log(status, "\n", analysis);
        return {
            status,
            analysis,
            risks,
            thresholds: RISK_THRESHOLDS,
            quarantineReasons,
        };

    } catch (error) {
        console.error('Image analysis failed:', error.message);
        return {
            status: 'error',
            error: error.response?.data || error.message,

        };
    }
};

module.exports = analyzeImage;