const { EsewaPaymentGateway, EsewaCheckStatus, generateUniqueId, } = require("esewajs")
const Transaction = require("../models/transaction.model.js");
const { MERCHANT_ID, MERCHANT_SECRET, SUCCESS_URL, FAILURE_URL, ESEWAPAYMENT_URL, ESEWAPAYMENT_STATUS_CHECK_URL } = require("../config/env.js")
const Room = require("../models/room.models.js")
const esewaInitiatePayment = async (amount, purpose, mode, userId) => {
    const productId = generateUniqueId();

    if (!amount || !productId) {
        throw new Error("Missing amount or productId");
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

        if (!reqPayment || reqPayment.status !== 200) {
            throw new Error("Error sending data to Esewa");
        }

        const transaction = await Transaction.create({
            product_id: productId,
            amount,
            userId,
            purpose,
            mode
        });

        const url = reqPayment.request?.res?.responseUrl;
        if (!url) {
            throw new Error("Esewa did not return a valid URL");
        }

        return { url, transaction };
    } catch (error) {
        console.error("Esewa initiation error:", error);
        throw error;
    }
};


const paymentStatus = async (req, res) => {
    const { product_id, room_id } = req.body; // Extract data from request body
    // console.log("Product ID", transaction_id)
    try {
        // Find the transaction by its signature
        const transaction = await Transaction.findOne({ product_id });
        if (!transaction) {
            return res.status(400).json({ error: "TRANSACTION_NOT_FOUND", message: "Transaction not found" });
        }

        const paymentStatusCheck = await EsewaCheckStatus(transaction.amount, transaction.product_id, MERCHANT_ID, ESEWAPAYMENT_STATUS_CHECK_URL)

        if (paymentStatusCheck.status === 200) {
            // Update the transaction status
            transaction.status = paymentStatusCheck.data.status;
            await transaction.save();
            const room = await Room.findById(room_id);
            room.paid = true;
            await room.save();
            return res
                .status(200)
                .json({ message: "Transaction completed successfully" });
        }
    } catch (error) {
        console.error("Error updating transaction status:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { esewaInitiatePayment, paymentStatus }
