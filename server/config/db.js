import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || 3306),
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 5,
            min: 1,  // Keep at least 1 connection alive
            acquire: 60000,  // Increase to 60 seconds
            idle: 30000,  // Increase to 30 seconds before eviction
            evict: 60000  // Evict idle connections after 60 seconds
        },
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false  // Accept Aiven's self-signed certificates
            },
            supportBigNumbers: true,
            bigNumberStrings: true,
            connectTimeout: 60000  // 60 second connection timeout
        },
        retry: {
            max: 3,  // Retry failed connections 3 times
            timeout: 5000  // Wait 5 seconds between retries
        },
        define: {
            timestamps: true,
            underscored: false
        }
    }
);

// Handle connection errors gracefully
let isConnected = false;

const connectDB = async () => {
  try {
    console.log('🔄 Attempting MySQL connection to:', process.env.DB_HOST);
    await sequelize.authenticate();
    console.log('✅ MySQL Connected via Sequelize to Aiven...');
    isConnected = true;

    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized...');
    console.log('✅ [Database] Connection pool initialized successfully');
  } catch (err) {
    console.error('❌ Sequelize Connection error:', err.message);
    console.error('   Details:', err.original?.message || err.code);
    isConnected = false;
    process.exit(1);
  }
};

// Keep-alive mechanism to prevent connection timeout
let keepAliveInterval = null;

const startKeepAlive = () => {
  if (keepAliveInterval) return;
  
  keepAliveInterval = setInterval(async () => {
    if (!isConnected) return;
    
    try {
      await sequelize.authenticate();
      // Connection still alive, no output needed
    } catch (err) {
      console.error('⚠️  [Database] Connection lost, attempting to reconnect...');
      isConnected = false;
      try {
        await sequelize.authenticate();
        console.log('✅ [Database] Connection restored');
        isConnected = true;
      } catch (reconnectErr) {
        console.error('❌ [Database] Reconnection failed:', reconnectErr.message);
      }
    }
  }, 30000); // Check every 30 seconds
};

export { sequelize, connectDB, startKeepAlive };