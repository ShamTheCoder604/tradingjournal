import { db } from './firebase-config.js';
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const balanceInput = document.getElementById('balance');
const calculateLotButton = document.getElementById('calculateLot');
const lotSizeResult = document.getElementById('lotSizeResult');
const checklistItems = document.querySelectorAll('.checklist');
const wonButton = document.getElementById('wonButton');
const lostButton = document.getElementById('lostButton');
const submitTrade = document.getElementById('submitTrade');
const commentsInput = document.getElementById('comments');
const tradeHistory = document.getElementById('tradeHistory');

let tradeResult = '';

calculateLotButton.addEventListener('click', () => {
  const balance = parseFloat(balanceInput.value);
  if (!isNaN(balance) && balance > 0) {
    let riskAmount = balance * 0.20;
    let lotSize = riskAmount / 20; // 20 pip SL
    if (lotSize > 200) lotSize = 200;
    lotSizeResult.innerText = `Recommended Lot Size: ${lotSize.toFixed(2)} lots`;
  } else {
    lotSizeResult.innerText = 'Enter a valid balance!';
  }
});

checklistItems.forEach(item => {
  item.addEventListener('change', () => {
    const allChecked = Array.from(checklistItems).every(i => i.checked);
    wonButton.disabled = !allChecked;
    lostButton.disabled = !allChecked;
    submitTrade.disabled = !allChecked;
  });
});

wonButton.addEventListener('click', () => {
  tradeResult = 'Won';
});

lostButton.addEventListener('click', () => {
  tradeResult = 'Lost';
});

submitTrade.addEventListener('click', async () => {
  const balance = parseFloat(balanceInput.value);
  if (!balance || !tradeResult) {
    alert('Fill everything first!');
    return;
  }

  const now = new Date();
  const tradeData = {
    balance,
    lotSize: lotSizeResult.innerText,
    result: tradeResult,
    comments: commentsInput.value,
    timestamp: now.toLocaleString()
  };

  try {
    await addDoc(collection(db, "trades"), tradeData);
    alert('Trade Logged Successfully!');
    loadTrades();
  } catch (e) {
    alert('Error logging trade');
    console.error(e);
  }
});

async function loadTrades() {
  tradeHistory.innerHTML = '';
  const querySnapshot = await getDocs(collection(db, "trades"));
  querySnapshot.forEach((doc) => {
    const trade = doc.data();
    tradeHistory.innerHTML += `
      <div class="trade">
        <strong>Time:</strong> ${trade.timestamp}<br>
        <strong>Result:</strong> ${trade.result}<br>
        <strong>Lot Size:</strong> ${trade.lotSize}<br>
        <strong>Comments:</strong> ${trade.comments}<br><br>
      </div>
    `;
  });
}

loadTrades();
