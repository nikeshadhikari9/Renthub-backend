const app = require('./src/app');
const connectDB = require('./src/config/db');
const { PORT } = require('./src/config/env');
//const analyzeImage = require('./src/services/sightEngineImageAnalyzer.services');

const authRoutes = require('./src/routes/auth.routes')
const adminRoutes = require('./src/routes/admin.routes')
const tenantRoutes = require('./src/routes/tenants.routes')
const userRoutes = require('./src/routes/user.routes')
const landlordRoutes = require('./src/routes/landlord.routes')
const roomRoutes = require('./src/routes/room.routes')
const transactionRoutes = require('./src/routes/transaction.routes')

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/room', roomRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/user', userRoutes);
app.use('/api/landlord', landlordRoutes);
app.use('/api/transaction', transactionRoutes);

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});