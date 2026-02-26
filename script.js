const userCards = document.getElementById('userCards');
const searchInput = document.getElementById('search');
const themeToggle = document.getElementById('themeToggle');
const usernameInput = document.getElementById('username');
const userForm = document.getElementById('userForm');

let usersData = [];
let myChart; // для Chart.js

// Skeleton Loader
function showSkeleton(count = 10) {
  userCards.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const card = document.createElement('div');
    card.className = 'card skeleton';
    card.innerHTML = `<h3>Loading</h3><p>Loading</p>`;
    userCards.appendChild(card);
  }
}

// Render карток
function renderCards(data) {
  if (!data.length) { userCards.innerHTML = '<p>Нічого не знайдено</p>'; return; }
  userCards.innerHTML = '';
  data.forEach((user,index)=>{
    const card = document.createElement('div');
    card.className='card';
    card.style.animationDelay=`${index*0.1}s`;
    card.innerHTML = `
      <h3>${user.name}</h3>
      <p>${user.email}</p>
      <p class="user-info">${user.company.name}</p>
    `;
    card.addEventListener('click',()=>{ 
      alert(`Інформація:\n${user.name}\n${user.username}\nТелефон: ${user.phone}\nСайт: ${user.website}`); 
    });
    userCards.appendChild(card);
  });
  applyThemeToCards();
}

// ---------------- Chart.js ----------------
function renderChart(data) {
  const ctx = document.getElementById('myChart').getContext('2d');
  const labels = data.slice(0,10).map(u=>u.name);
  const dataset = data.slice(0,10).map(u=>u.name.length*3); // приклад "активності"
  if(myChart) myChart.destroy();
  myChart = new Chart(ctx,{
    type:'bar',
    data:{ labels: labels, datasets:[{
      label:'Активність користувачів',
      data: dataset,
      backgroundColor:'rgba(75,192,192,0.6)',
      borderColor:'rgba(75,192,192,1)',
      borderWidth:1
    }]},
    options:{ responsive:true, animation:{duration:1000}, scales:{y:{beginAtZero:true}} }
  });
}

// Fetch API
async function fetchData() {
  showSkeleton();
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/users');
    if(!res.ok) throw new Error('API недоступне');
    usersData = await res.json();
    usersData = [...usersData,...usersData]; // більше користувачів
    renderCards(usersData);
    renderChart(usersData);
  } catch(error){
    userCards.innerHTML=`<p style="color:red;">Помилка: ${error.message}</p>`;
  }
}

// Пошук
searchInput.addEventListener('input', ()=>{
  const filtered = usersData.filter(u=>u.name.toLowerCase().includes(searchInput.value.toLowerCase()));
  renderCards(filtered);
  renderChart(filtered);
});

// Theme
document.body.className = localStorage.getItem('theme')||'light';
themeToggle.addEventListener('click',()=>{
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
  localStorage.setItem('theme',document.body.className);
  applyThemeToCards();
});
function applyThemeToCards(){
  document.querySelectorAll('.card').forEach(card=>{
    card.classList.toggle('dark',document.body.classList.contains('dark'));
  });
}

// Username
usernameInput.value = localStorage.getItem('username')||'';
usernameInput.addEventListener('input',()=>{ localStorage.setItem('username',usernameInput.value); });

// Форма
usernameInput.addEventListener('input',()=>{
  if(usernameInput.value.trim().length>=3){ usernameInput.classList.add('valid'); usernameInput.classList.remove('invalid'); }
  else { usernameInput.classList.add('invalid'); usernameInput.classList.remove('valid'); }
});
userForm.addEventListener('submit',e=>{
  e.preventDefault();
  if(usernameInput.value.trim().length<3){ alert('Ім’я має бути щонайменше 3 символи'); return; }
  alert('Форма відправлена!');
});

// Погода (OpenWeatherMap)
async function fetchWeather(){
  const weatherDiv=document.getElementById('weather');
  const apiKey='YOUR_API_KEY'; // вставити свій ключ
  const city='Kyiv';
  try{
    const res=await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=uk`);
    const data=await res.json();
    weatherDiv.innerHTML=`Погода у ${city}: ${data.weather[0].description}, ${data.main.temp}°C`;
  }catch{ weatherDiv.innerHTML='Погода недоступна'; }
}

// Старт
fetchData();
fetchWeather();