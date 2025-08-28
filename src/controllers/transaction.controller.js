const { EsewaPaymentGateway, EsewaCheckStatus } = require("esewajs")
const Transaction = require("../models/transaction.model.js");
const { MERCHANT_ID, MERCHANT_SECRET, SUCCESS_URL, FAILURE_URL, ESEWAPAYMENT_URL } = require("../config/env.js")

const esewaInitiatePayment = async (req, res) => {
    const { amount, productId } = req.body;
    if (!amount || !productId) {
        return res.status(400).json({ message: "Missing amount or productId" });
    }

    try {
        const reqPayment = await EsewaPaymentGateway(
            Number(amount), 0, 0, 0, productId,
            MERCHANT_ID,
            MERCHANT_SECRET,
            SUCCESS_URL,
            FAILURE_URL,
            ESEWAPAYMENT_URL
        );

        // console.log("Esewa response:", reqPayment);

        if (!reqPayment || reqPayment.status !== 200) {
            return res.status(400).json({ message: "Error sending data to Esewa" });
        }

        const transaction = await Transaction.create({ product_id: productId, amount });
        return res.json({ url: reqPayment.request.res.responseUrl });
    } catch (error) {
        console.error("Esewa initiation error:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};




const paymentStatus = async (req, res) => {
    const { product_id } = req.body; // Extract data from request body
    console.log("Product ID", product_id)
    try {
        // Find the transaction by its signature
        const transaction = await Transaction.findOne({ product_id });
        if (!transaction) {
            return res.status(400).json({ message: "Transaction not found" });
        }

        const paymentStatusCheck = await EsewaCheckStatus(transaction.amount, transaction.product_id, process.env.MERCHANT_ID, process.env.ESEWAPAYMENT_STATUS_CHECK_URL)



        if (paymentStatusCheck.status === 200) {
            // Update the transaction status
            transaction.status = paymentStatusCheck.data.status;
            await transaction.save();
            res
                .status(200)
                .json({ message: "Transaction status updated successfully" });
        }
    } catch (error) {
        console.error("Error updating transaction status:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { esewaInitiatePayment, paymentStatus }
