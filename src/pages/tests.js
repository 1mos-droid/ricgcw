async function testMembers() {
  console.log("Testing Members API...");
  try {
    const response = await fetch('http://localhost:3002/api/members');
    if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Data is not an array");
    console.log("✅ Members API test passed!");
  } catch (error) {
    console.error("❌ Members API test failed:", error.message);
  }
}

async function testEvents() {
  console.log("Testing Events API...");
  try {
    const response = await fetch('http://localhost:3002/api/events');
    if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Data is not an array");
    console.log("✅ Events API test passed!");
  } catch (error) {
    console.error("❌ Events API test failed:", error.message);
  }
}

async function testBibleStudies() {
  console.log("Testing Bible Studies API...");
  try {
    const response = await fetch('http://localhost:3002/api/bible-studies');
    if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Data is not an array");
    console.log("✅ Bible Studies API test passed!");
  } catch (error) {
    console.error("❌ Bible Studies API test failed:", error.message);
  }
}

async function runTests() {
  await testMembers();
  await testEvents();
  await testBibleStudies();
}

runTests();
