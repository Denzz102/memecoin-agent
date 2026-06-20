const groq = require("../config/groq");

async function testGroq() {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: "Halo, apakah koneksi Groq berhasil?"
        }
      ]
    });

    console.log("✅ Groq Connected");
    console.log(response.choices[0].message.content);

  } catch (err) {
    console.error("❌ Groq Error");
    console.error(err.message);
  }
}

testGroq();