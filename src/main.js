import './style.css';

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const submitBtn = document.getElementById('submit-btn');
    const challengerInput = document.getElementById('challenger-input');
    const resultContainer = document.getElementById('result-container');
    const resultContent = document.getElementById('result-content');
    const resultText = document.getElementById('result-text');
    
    // --- Event Listeners ---
    submitBtn.addEventListener('click', challenge);
    challengerInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            challenge();
        }
    });

    // --- Core Logic Function ---
    async function challenge() {
        const userInput = challengerInput.value.trim();

        if (!userInput) {
            displayResult("ต้องใส่อะไรซักอย่างสิวะ! แค่นี้ก็คิดไม่ได้... ไม่แปลกใจที่เถียงเมียไม่เคยชนะ", 'error');
            return;
        }

        // --- Set Loading State ---
        submitBtn.disabled = true;
        challengerInput.disabled = true;
        resultContainer.classList.remove('glow', 'border-red-500');
        resultContent.innerHTML = `
            <div class="text-center">
                <span class="loader"></span>
                <p class="mt-4 text-amber-400 animate-pulse">กำลังประมวลผลด้วยพลังแห่งจักรวาล... โปรดรอ</p>
            </div>
        `;
        
        // --- Gemini API Call ---
        try {
            // This is the prompt we send to Gemini
            const prompt = `Role มึงคือ AI สุดหยาบ จงหักล้างอย่างหยาบๆ ฮาๆ และเจ็บแสบว่าทำไม '${userInput}' ถึงไม่มีทางเอาชนะสิ่งมีชีวิตที่เรียกว่า"เมีย"ได้เลย ตอบสั้นๆ ไม่เกิน 3 ประโยค`;

            let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
            const payload = { contents: chatHistory };
            
            // The API key is left empty. The environment will handle it.
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API error! status: ${response.status}`);
            }

            const result = await response.json();
            
            let generatedText = "ขออภัย, พลังของเมียนั้นยิ่งใหญ่เกินกว่าที่ AI จะคำนวณได้ ลองใหม่อีกครั้ง";
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                generatedText = result.candidates[0].content.parts[0].text;
            }
            
            displayResult(generatedText, 'error');

        } catch (error) {
            console.error("Error calling Gemini API:", error);
            const errorMessage = "ชิบหายละ! สงสัยพลังเมียจะแรงเกิน จน AI ข้าเดี้ยงไปเลยว่ะ ลองใหม่อีกทีนะ";
            displayResult(errorMessage, 'error');
        } finally {
            // --- Reset UI State ---
            submitBtn.disabled = false;
            challengerInput.disabled = false;
            challengerInput.value = '';
        }
    }

    function displayResult(message, type) {
        // Restore original result content structure
        resultContent.innerHTML = `<p id="result-text" class="text-lg"></p>`;
        const newResultText = document.getElementById('result-text');
        
        newResultText.textContent = message;

        if (type === 'error') {
            resultContainer.classList.add('border-red-500');
            newResultText.classList.add('text-red-400');
            resultContainer.classList.add('glow');
            setTimeout(() => resultContainer.classList.remove('glow'), 1000);
        }
    }
});