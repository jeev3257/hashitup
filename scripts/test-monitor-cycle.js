
import monitor from './emission-monitor.js';

console.log('🧪 Testing one monitoring cycle...');

// Stop any existing interval and run one cycle manually
if (monitor.intervalId) {
  clearInterval(monitor.intervalId);
}

try {
  await monitor.checkAllCompanies();
  console.log('✅ Monitoring cycle completed successfully!');
} catch (error) {
  console.error('❌ Test failed:', error);
} finally {
  process.exit(0);
}