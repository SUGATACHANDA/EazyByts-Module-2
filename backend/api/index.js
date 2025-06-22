const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const yahooFinance = require('yahoo-finance2').default;

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
mongoose
    .connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

const stockSchema = new mongoose.Schema({
    symbol: { type: String, required: true, unique: true },
    lastPrice: { type: Number, required: true },
    currency: { type: String },
    lastTrackedTime: { type: Date, required: true },
});

const Stock = mongoose.model("Stock", stockSchema);

async function fetchStockData(symbol) {
    const quote = await yahooFinance.quote(symbol);
    return {
        symbol,
        price: quote.regularMarketPrice,
        time: new Date(),
        currency: quote.currency || "INR",
    };
}

const activeTrackers = new Map();

io.on("connection", (socket) => {
    console.log("📡 Client connected:", socket.id);

    socket.on("startTracking", (symbol) => {
        const existing = activeTrackers.get(socket.id);
        if (existing) {
            clearInterval(existing.interval);
        }

        let latestData = null;

        const interval = setInterval(async () => {
            try {
                const stockData = await fetchStockData(symbol);
                latestData = stockData;
                socket.emit("stockData", stockData);
            } catch (err) {
                console.error("❌ Error fetching stock data:", err.message);
                socket.emit("error", "Error fetching stock data.");
            }
        }, 2000);

        activeTrackers.set(socket.id, { symbol, interval, getLatest: () => latestData });
    });

    socket.on("stopTracking", async () => {
        const tracker = activeTrackers.get(socket.id);
        if (tracker) {
            clearInterval(tracker.interval);

            const lastData = tracker.getLatest();
            if (lastData) {
                try {
                    await Stock.findOneAndUpdate(
                        { symbol: lastData.symbol },
                        {
                            lastPrice: lastData.price,
                            currency: lastData.currency,
                            lastTrackedTime: lastData.time,
                        },
                        { upsert: true, new: true, setDefaultsOnInsert: true }
                    );
                    console.log("✅ Stock data upserted to DB:", lastData.symbol, lastData.currency);
                } catch (err) {
                    console.error("❌ Error upserting to DB:", err.message);
                }
            }

            activeTrackers.delete(socket.id);
        }
    });

    socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
        const tracker = activeTrackers.get(socket.id);
        if (tracker) {
            clearInterval(tracker.interval);
            activeTrackers.delete(socket.id);
        }
    });
});

app.get("/api/stocks/recent", async (req, res) => {
    try {
        const stocks = await Stock.find().sort({ lastTrackedTime: -1 }).limit(20);
        res.json(stocks);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch recent tracked stocks." });
    }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
