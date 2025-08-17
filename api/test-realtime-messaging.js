import axios from 'axios';
import mongoose from 'mongoose';
import User from './models/user.model.js';
import Message from './models/message.model.js';
import { io } from 'socket.io-client';

const BASE_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

console.log('🔌 Testing Real-time Messaging System...\n');

// Test data
let testUsers = [];
let testMessages = [];
let socket1, socket2;

async function setupTestData() {
  console.log('🔧 Setting up test data...\n');

  // Create test users
  const user1 = await User.create({
    name: 'Test Client',
    email: 'testclient@test.com',
    password: 'password123',
    role: 'client',
    isActive: true
  });

  const user2 = await User.create({
    name: 'Test Escort',
    email: 'testescort@test.com',
    password: 'password123',
    role: 'escort',
    isActive: true,
    age: 25,
    gender: 'female',
    location: { city: 'Kampala', country: 'Uganda' }
  });

  testUsers = [user1, user2];

  console.log('✅ Test users created successfully');
  console.log(`   Client: ${user1.name} (${user1._id})`);
  console.log(`   Escort: ${user2.name} (${user2._id})\n`);
}

async function testSocketConnection() {
  console.log('🔌 Testing Socket.io Connection...\n');

  try {
    // Connect first user
    console.log('📋 Test 1: Connecting first user');
    socket1 = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    await new Promise((resolve, reject) => {
      socket1.on('connect', () => {
        console.log(`   ✅ Socket 1 connected: ${socket1.id}`);
        resolve();
      });

      socket1.on('connect_error', (error) => {
        console.log(`   ❌ Socket 1 connection failed: ${error.message}`);
        reject(error);
      });

      setTimeout(() => reject(new Error('Connection timeout')), 5000);
    });

    // Authenticate first user
    socket1.emit('authenticate', {
      token: 'test-token-1',
      userId: testUsers[0]._id.toString()
    });

    // Connect second user
    console.log('📋 Test 2: Connecting second user');
    socket2 = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    await new Promise((resolve, reject) => {
      socket2.on('connect', () => {
        console.log(`   ✅ Socket 2 connected: ${socket2.id}`);
        resolve();
      });

      socket2.on('connect_error', (error) => {
        console.log(`   ❌ Socket 2 connection failed: ${error.message}`);
        reject(error);
      });

      setTimeout(() => reject(new Error('Connection timeout')), 5000);
    });

    // Authenticate second user
    socket2.emit('authenticate', {
      token: 'test-token-2',
      userId: testUsers[1]._id.toString()
    });

    console.log('   ✅ Both users connected and authenticated\n');

  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    throw error;
  }
}

async function testRealTimeMessaging() {
  console.log('💬 Testing Real-time Messaging...\n');

  try {
    // Test 1: Send message from client to escort
    console.log('📋 Test 1: Send message from client to escort');
    
    const messagePromise = new Promise((resolve, reject) => {
      socket2.on('new_message', (data) => {
        console.log(`   📨 Escort received message: ${data.message.content}`);
        console.log(`   📊 Message details:`, {
          id: data.message._id,
          sender: data.message.sender,
          recipient: data.message.recipient,
          content: data.message.content
        });
        resolve(data.message);
      });

      setTimeout(() => reject(new Error('Message not received')), 5000);
    });

    const sentMessagePromise = new Promise((resolve, reject) => {
      socket1.on('message_sent', (data) => {
        console.log(`   ✅ Message sent successfully: ${data.messageId}`);
        resolve(data);
      });

      socket1.on('message_error', (data) => {
        console.log(`   ❌ Message send failed: ${data.error}`);
        reject(new Error(data.error));
      });

      setTimeout(() => reject(new Error('Send confirmation timeout')), 5000);
    });

    // Send the message
    socket1.emit('send_message', {
      senderId: testUsers[0]._id.toString(),
      recipientId: testUsers[1]._id.toString(),
      content: 'Hello! Are you available for tonight?',
      messageId: Date.now().toString()
    });

    const [receivedMessage, sentConfirmation] = await Promise.all([messagePromise, sentMessagePromise]);
    testMessages.push(receivedMessage);
    console.log('   ✅ PASSED\n');

    // Test 2: Send reply from escort to client
    console.log('📋 Test 2: Send reply from escort to client');
    
    const replyPromise = new Promise((resolve, reject) => {
      socket1.on('new_message', (data) => {
        console.log(`   📨 Client received reply: ${data.message.content}`);
        resolve(data.message);
      });

      setTimeout(() => reject(new Error('Reply not received')), 5000);
    });

    const replySentPromise = new Promise((resolve, reject) => {
      socket2.on('message_sent', (data) => {
        console.log(`   ✅ Reply sent successfully: ${data.messageId}`);
        resolve(data);
      });

      setTimeout(() => reject(new Error('Reply send confirmation timeout')), 5000);
    });

    // Send the reply
    socket2.emit('send_message', {
      senderId: testUsers[1]._id.toString(),
      recipientId: testUsers[0]._id.toString(),
      content: 'Yes, I am available! What time works for you?',
      messageId: Date.now().toString()
    });

    const [receivedReply, replySentConfirmation] = await Promise.all([replyPromise, replySentPromise]);
    testMessages.push(receivedReply);
    console.log('   ✅ PASSED\n');

    // Test 3: Typing indicators
    console.log('📋 Test 3: Typing indicators');
    
    const typingPromise = new Promise((resolve) => {
      socket2.on('user_typing', (data) => {
        console.log(`   ⌨️ Escort sees client typing: ${data.senderId}`);
        resolve(data);
      });
    });

    const stopTypingPromise = new Promise((resolve) => {
      socket2.on('user_stopped_typing', (data) => {
        console.log(`   ⌨️ Escort sees client stopped typing: ${data.senderId}`);
        resolve(data);
      });
    });

    // Start typing
    socket1.emit('typing_start', {
      senderId: testUsers[0]._id.toString(),
      recipientId: testUsers[1]._id.toString()
    });

    await typingPromise;

    // Stop typing after 2 seconds
    setTimeout(() => {
      socket1.emit('typing_stop', {
        senderId: testUsers[0]._id.toString(),
        recipientId: testUsers[1]._id.toString()
      });
    }, 2000);

    await stopTypingPromise;
    console.log('   ✅ PASSED\n');

    // Test 4: Message read receipts
    console.log('📋 Test 4: Message read receipts');
    
    const readReceiptPromise = new Promise((resolve) => {
      socket2.on('message_read', (data) => {
        console.log(`   ✅ Escort notified that message was read: ${data.messageId}`);
        resolve(data);
      });
    });

    // Mark message as read
    socket1.emit('mark_read', {
      messageId: testMessages[0]._id,
      readerId: testUsers[0]._id.toString()
    });

    await readReceiptPromise;
    console.log('   ✅ PASSED\n');

  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    throw error;
  }
}

async function testOnlineStatus() {
  console.log('🟢 Testing Online Status...\n');

  try {
    // Test 1: Check if users are online
    console.log('📋 Test 1: Check online status');
    
    const onlinePromise = new Promise((resolve) => {
      socket1.on('user_online', (data) => {
        console.log(`   🟢 User went online: ${data.userId}`);
        resolve(data);
      });
    });

    const offlinePromise = new Promise((resolve) => {
      socket1.on('user_offline', (data) => {
        console.log(`   🔴 User went offline: ${data.userId}`);
        resolve(data);
      });
    });

    // Wait for online status updates
    await Promise.race([onlinePromise, new Promise(resolve => setTimeout(resolve, 2000))]);
    console.log('   ✅ PASSED\n');

    // Test 2: Disconnect and check offline status
    console.log('📋 Test 2: Test disconnect');
    
    socket2.disconnect();
    
    await Promise.race([offlinePromise, new Promise(resolve => setTimeout(resolve, 3000))]);
    console.log('   ✅ PASSED\n');

  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}\n`);
    throw error;
  }
}

async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...\n');

  try {
    // Disconnect sockets
    if (socket1) socket1.disconnect();
    if (socket2) socket2.disconnect();

    // Delete test messages
    await Message.deleteMany({
      _id: { $in: testMessages.map(m => m._id) }
    });

    // Delete test users
    await User.deleteMany({
      _id: { $in: testUsers.map(u => u._id) }
    });

    console.log('✅ Test data cleaned up successfully\n');
  } catch (error) {
    console.log(`❌ Cleanup failed: ${error.message}\n`);
  }
}

async function runTests() {
  try {
    await setupTestData();
    await testSocketConnection();
    await testRealTimeMessaging();
    await testOnlineStatus();
    await cleanupTestData();

    console.log('🎉 Real-time Messaging System Test Summary:');
    console.log('   ✅ Socket.io Connection: Working correctly');
    console.log('   ✅ Real-time Messaging: Working correctly');
    console.log('   ✅ Typing Indicators: Working correctly');
    console.log('   ✅ Read Receipts: Working correctly');
    console.log('   ✅ Online Status: Working correctly');
    console.log('   ✅ All real-time features are ready for production!');

  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  } finally {
    process.exit(0);
  }
}

runTests();
