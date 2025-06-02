// Test script to verify the development setup
import { devDb } from './src/db/DevelopmentDatabaseAdapter';

async function testDevelopmentSetup() {
    console.log('🧪 Testing Soccer Tips Development Setup');
    console.log('=====================================');
    
    // Test basic functionality
    console.log('\n1. Testing database adapter...');
    console.log(`Using mock data: ${devDb.isUsingMockData()}`);
    
    // Test teams query
    console.log('\n2. Testing teams query...');
    try {
        const teamsResult = await devDb.query('SELECT * FROM teams');
        console.log(`✅ Found ${teamsResult.rows.length} teams`);
        if (teamsResult.rows.length > 0) {
            console.log(`   First team: ${teamsResult.rows[0].name}`);
        }
    } catch (error) {
        console.log(`❌ Teams query failed: ${error}`);
    }
    
    // Test matches query
    console.log('\n3. Testing matches query...');
    try {
        const matchesResult = await devDb.query('SELECT * FROM matches');
        console.log(`✅ Found ${matchesResult.rows.length} matches`);
        if (matchesResult.rows.length > 0) {
            console.log(`   First match: ${matchesResult.rows[0].homeTeam} vs ${matchesResult.rows[0].awayTeam}`);
        }
    } catch (error) {
        console.log(`❌ Matches query failed: ${error}`);
    }
    
    // Test users query
    console.log('\n4. Testing users query...');
    try {
        const usersResult = await devDb.query('SELECT * FROM users');
        console.log(`✅ Found ${usersResult.rows.length} users`);
        if (usersResult.rows.length > 0) {
            console.log(`   First user: ${usersResult.rows[0].name}`);
        }
    } catch (error) {
        console.log(`❌ Users query failed: ${error}`);
    }
    
    console.log('\n🎉 Development setup test completed!');
    console.log('\nTo start the development server:');
    console.log('1. npm run dev');
    console.log('2. Visit http://localhost:3000');
    console.log('\nTo switch to real MySQL database:');
    console.log('1. Set DEV_MODE=mysql in .env');
    console.log('2. Ensure MySQL is running on localhost:3306');
}

// Run the test
testDevelopmentSetup().catch(console.error);
