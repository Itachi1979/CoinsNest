let coins = 0;
let level = 1;
let lastBonus = 0;

function updateUI() {
  document.getElementById("coins").innerText = coins;
  document.getElementById("level").innerText = level;

  level = Math.floor(coins / 100) + 1;
}

function watchAd() {
  coins += 10;
  showMsg("You earned 10 coins!");
  updateUI();
}

function completeOffer() {
  coins += 50;
  showMsg("Offer completed! +50 coins");
  updateUI();
}

function dailyBonus() {
  let today = new Date().getDate();

  if (lastBonus === today) {
    showMsg("Daily bonus already claimed!");
    return;
  }

  coins += 20;
  lastBonus = today;
  showMsg("Daily bonus claimed! +20 coins");
  updateUI();
}

function openWallet() {
  window.location.href = "wallet.html";
}



function showMsg(text) {
  document.getElementById("msg").innerText = text;
}

function updateUI() {

  document.getElementById("coins").innerText = coins;

  
  localStorage.setItem("coins", coins);

}



function openprofile() {
  window.location.href = "profile.html";
}


function openticket(){
  window.location.href ="ticket.html"
}

function opensuperoffer(){
  window.location.href ="superoffer.html"
}

function openwallet(){
  window.location.href ="wallet.html"
}