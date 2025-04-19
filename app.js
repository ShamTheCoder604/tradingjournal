// Your Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Get elements
const winBtn = document.getElementById('winBtn');
const lossBtn = document.getElementById('lossBtn');
const submitBtn = document.getElementById('submitBtn');
const commentInput = document.getElementById('comment');
const balanceInput = document.getElementById('balance');
const screenshotInput = document.getElementById('screenshot');
let outcome = 'win'; // default

winBtn.onclick = () => {
  outcome = 'win';
  winBtn.classList.add('bg-green-700');
  lossBtn.classList.remove('bg-red-700');
};

lossBtn.onclick = () => {
  outcome = 'loss';
  lossBtn.classList.add('bg-red-700');
  winBtn.classList.remove('bg-green-700');
};

submitBtn.onclick = async () => {
  const comment = commentInput.value;
  const balance = parseFloat(balanceInput.value);
  const file = screenshotInput.files[0];

  if (!balance || isNaN(balance)) {
    alert("Please enter a valid balance.");
    return;
  }

  const { lotSize, riskAmount } = calculateLotSize(balance);

  let screenshotURL = '';
  if (file) {
    const storageRef = firebase.storage().ref();
    const fileRef = storageRef.child('screenshots/' + file.name);
    await fileRef.put(file);
    screenshotURL = await fileRef.getDownloadURL();
  }

  await db.collection('trades').add({
    outcome,
    comments: comment,
    balanceAfter: balance,
    lotSize,
    riskAmount,
    screenshotURL,
    timestamp: Date.now()
  });

  commentInput.value = '';
  balanceInput.value = '';
  screenshotInput.value = '';
  alert("Trade submitted!");
};

// Proper Lot Size Calculation
function calculateLotSize(balance) {
  const riskPercent = 0.02; // Risk 2% per trade
  const stopLossPips = 20; // 20 pips
  const riskAmount = balance * riskPercent;
  const pipValuePerLot = 9.1; // For USD/JPY
  
  const lotSize = riskAmount / (stopLossPips * pipValuePerLot);
  
  return {
    lotSize: lotSize.toFixed(2),
    riskAmount: riskAmount.toFixed(2)
  };
}

// Load trades and update dashboard
function loadTrades() {
  const tradeLog = document.getElementById('trade-log');
  const totalTradesEl = document.getElementById('total-trades');
  const winPercentageEl = document.getElementById('win-percentage');
  const netProfitEl = document.getElementById('net-profit');

  db.collection('trades').orderBy('timestamp', 'desc')
    .onSnapshot(snapshot => {
      tradeLog.innerHTML = '';
      let wins = 0;
      let losses = 0;
      let netProfit = 0;

      snapshot.forEach(doc => {
        const trade = doc.data();
        
        tradeLog.innerHTML += `
          <div class="p-4 bg-gray-700 rounded-xl shadow-lg space-y-2">
            <div class="flex justify-between">
              <span class="font-bold text-lg">${trade.outcome === 'win' ? '✅ Win' : '❌ Loss'}</span>
              <span class="text-sm">${new Date(trade.timestamp).toLocaleDateString()}</span>
            </div>
            <p>${trade.comments || 'No comments'}</p>
            ${trade.screenshotURL ? `<img src="${trade.screenshotURL}" class="rounded-lg mt-2" />` : ''}
            <div class="flex justify-between text-sm text-gray-400 mt-2">
              <span>Balance: $${trade.balanceAfter.toFixed(2)}</span>
              <span>Lot Size: ${trade.lotSize}</span>
            </div>
          </div>
        `;

        if (trade.outcome === 'win') {
          wins++;
          netProfit += parseFloat(trade.riskAmount); // assuming reward = risk
        } else {
          losses++;
          netProfit -= parseFloat(trade.riskAmount);
        }
      });

      const total = wins + losses;
      const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : 0;
      
      totalTradesEl.innerText = total;
      winPercentageEl.innerText = winRate + "%";
      netProfitEl.innerText = "$" + netProfit.toFixed(2);
    });
}

loadTrades();
