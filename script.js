document.addEventListener('DOMContentLoaded', () => {
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mdaledow';

  // 0. Media modal (Experience & Community)
  const mediaModal = document.getElementById('mediaModal');
  const mediaModalImg = document.getElementById('mediaModalImg');
  const mediaModalGallery = document.getElementById('mediaModalGallery');
  const mediaModalVideo = document.getElementById('mediaModalVideo');
  const mediaModalPlaceholder = document.getElementById('mediaModalPlaceholder');

  function isDirectMediaUrl(url) {
    if (!url) return false;
    const u = url.toLowerCase();
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(u) || /\.(mp4|webm|ogg)$/i.test(u);
  }

  function openMediaModal(src, type) {
    mediaModalImg.style.display = 'none';
    if (mediaModalGallery) mediaModalGallery.style.display = 'none';
    mediaModalVideo.style.display = 'none';
    mediaModalPlaceholder.style.display = 'none';
    if (!src || !src.trim()) {
      mediaModalPlaceholder.style.display = 'block';
      mediaModal.classList.add('active');
      const chatW = document.getElementById('chatWidget');
      const chatMsgs = document.getElementById('chatMessages');
      if (chatW && chatMsgs) {
        chatW.style.display = 'flex';
        const botMsg = document.createElement('div');
        botMsg.className = 'message bot';
        botMsg.innerHTML = "Sorry — no media input yet for this section. You can try: <strong>Orientation Leader</strong>, <strong>Senator</strong>, <strong>The Crits</strong>, or <strong>Askmattrab</strong> for photos & videos. Or check <strong>Projects</strong>, <strong>Entertainment</strong> (games!), or ask me about skills & contact.";
        chatMsgs.appendChild(botMsg);
        chatMsgs.scrollTop = chatMsgs.scrollHeight;
      }
      return;
    }
    if (type === 'link' || !isDirectMediaUrl(src.split(',')[0].trim())) {
      window.open(src.split(',')[0].trim(), '_blank', 'noopener');
      return;
    }
    if (type === 'video') {
      mediaModalVideo.innerHTML = '';
      const source = document.createElement('source');
      source.src = src.trim();
      const ext = src.split('.').pop().toLowerCase();
      source.type = ext === 'webm' ? 'video/webm' : 'video/mp4';
      mediaModalVideo.appendChild(source);
      mediaModalVideo.style.display = 'block';
      mediaModalVideo.load();
    } else {
      const imgSrcs = src.split(',').map(s => s.trim()).filter(Boolean);
      if (imgSrcs.length > 1) {
        mediaModalGallery.innerHTML = '';
        imgSrcs.forEach(s => {
          const img = document.createElement('img');
          img.src = s;
          img.alt = 'Experience or community media';
          mediaModalGallery.appendChild(img);
        });
        mediaModalGallery.style.display = 'flex';
      } else {
        mediaModalImg.src = imgSrcs[0] || src;
        mediaModalImg.alt = 'Experience or community media';
        mediaModalImg.style.display = 'block';
      }
    }
    mediaModal.classList.add('active');
  }

  function closeMediaModal() {
    mediaModal.classList.remove('active');
    if (mediaModalVideo) {
      mediaModalVideo.pause();
    }
  }

  document.querySelectorAll('.btn-media-icon, .btn-media').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const item = btn.closest('.item');
      const src = (item && item.dataset.mediaSrc) || '';
      const type = (item && item.dataset.mediaType) || 'image';
      openMediaModal(src, type);
    });
  });


  mediaModal?.querySelector('.media-modal-backdrop').addEventListener('click', closeMediaModal);
  mediaModal?.querySelector('.media-modal-close').addEventListener('click', closeMediaModal);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && mediaModal?.classList.contains('active')) closeMediaModal(); });

  // 1. Tab Navigation
  const tabs = document.querySelectorAll(".tabs li");
  const tabContents = document.querySelectorAll(".tab-content");

  tabs.forEach(tab => {
      tab.addEventListener("click", () => {
          tabs.forEach(t => t.classList.remove("active"));
          tabContents.forEach(c => c.classList.remove("active"));
          tab.classList.add("active");
          document.getElementById(tab.getAttribute("data-target")).classList.add("active");
      });
  });

  // 2. Chatbot Logic
  const chatToggle = document.getElementById('chatToggle');
  const chatWidget = document.getElementById('chatWidget');
  const closeChat = document.getElementById('closeChat');
  const chatInput = document.getElementById('chatInput');
  const sendMessage = document.getElementById('sendMessage');
  const chatMessages = document.getElementById('chatMessages');
  const chatWhoAreYou = document.getElementById('chatWhoAreYou');

  chatToggle.addEventListener('click', () => {
      chatWidget.style.display = (chatWidget.style.display === 'flex') ? 'none' : 'flex';
  });
  closeChat.addEventListener('click', () => chatWidget.style.display = 'none');

  let visitorType = null;
  let messageCount = 0;
  let roleAsked = false;
  const ROLE_ASK_THRESHOLD = 3;
  chatWhoAreYou?.addEventListener('click', () => showRoleQuestion());

  const handleChat = () => {
      const userText = chatInput.value.trim();
      if (!userText) return;
      addMessage(userText, 'user');
      chatInput.value = '';
      messageCount++;
      setTimeout(() => {
          const botResponse = getBotResponse(userText.toLowerCase());
          if (typeof botResponse === 'string') addMessage(botResponse, 'bot');
          else if (botResponse && botResponse.html) addRichMessage(botResponse.html, 'bot');
          if (!roleAsked && messageCount >= ROLE_ASK_THRESHOLD) showRoleQuestion();
      }, 600);
  };

  sendMessage.addEventListener('click', handleChat);
  chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleChat(); });

  function addMessage(text, sender) {
      const msg = document.createElement('div');
      msg.className = `message ${sender}`;
      msg.innerText = text;
      chatMessages.appendChild(msg);
      chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function addRichMessage(html, sender) {
      const msg = document.createElement('div');
      msg.className = `message ${sender}`;
      msg.innerHTML = html;
      chatMessages.appendChild(msg);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      return msg;
  }

  function showRoleQuestion() {
      roleAsked = true;
      const html = `<p style="margin:0 0 8px 0;">By the way, who are you visiting as?</p><div class="chat-role-options"><button class="chat-role-btn" data-role="friend">1️⃣ Friend / just browsing</button><button class="chat-role-btn" data-role="professor">2️⃣ Professor / mentor</button><button class="chat-role-btn" data-role="recruiter">3️⃣ Recruiter / company</button><button class="chat-role-btn" data-role="other">4️⃣ Other visitor</button></div>`;
      const msg = addRichMessage(html, 'bot');
      msg.querySelectorAll('.chat-role-btn').forEach(btn => {
          btn.addEventListener('click', () => {
              visitorType = btn.dataset.role;
              addMessage("Got it — I'll tailor responses for you as a " + visitorType + ".", 'bot');
          });
      });
  }

  function applyColorFromPicker(hex) {
      document.documentElement.style.setProperty('--accent', hex);
      document.documentElement.style.setProperty('--primary', hex);
  }

  function showColorPicker() {
      const id = 'chatColorPicker' + Date.now();
      const html = `<p style="margin:0 0 8px 0;">Pick a color for the site theme:</p><div class="chat-color-picker-wrap"><input type="color" id="${id}" value="#3498db" /><button class="chat-apply-btn" data-target="${id}">Apply</button></div>`;
      const msg = addRichMessage(html, 'bot');
      const input = msg.querySelector('input[type="color"]');
      const applyBtn = msg.querySelector('.chat-apply-btn');
      const apply = () => applyColorFromPicker(input.value);
      input.addEventListener('input', apply);
      applyBtn.addEventListener('click', apply);
  }

  function showSuggestionForm() {
      const role = visitorType || 'visitor';
      const html = `<p style="margin:0 0 8px 0;">As a <strong>${role}</strong>, what areas do you think Gaurab could improve? Your suggestions will be emailed to him.</p><div class="chat-suggestion-form"><textarea placeholder="E.g. Consider building more full-stack projects, or deepening your DevOps experience..."></textarea><button class="chat-suggestion-submit">Submit Suggestion</button></div>`;
      const msg = addRichMessage(html, 'bot');
      const textarea = msg.querySelector('textarea');
      const btn = msg.querySelector('.chat-suggestion-submit');
      btn.addEventListener('click', async () => {
          const text = textarea.value.trim();
          if (!text) { btn.textContent = 'Type something first'; return; }
          if (FORMSPREE_ENDPOINT.includes('YOUR_FORMSPREE_ID')) {
              addMessage("Contact form not configured yet. Use the Contact tab and select 'Professional Suggestion' as the subject.", 'bot');
              return;
          }
          btn.disabled = true;
          btn.textContent = 'Sending...';
          try {
              const res = await fetch(FORMSPREE_ENDPOINT, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      _subject: 'Professional Suggestion from ' + role,
                      message: text,
                      visitorType: role,
                      name: 'Chat Suggestion'
                  })
              });
              if (!res.ok) throw new Error();
              btn.textContent = 'Thanks! Sent.';
              textarea.disabled = true;
              addMessage("Thank you for your feedback! Gaurab will review your suggestion.", 'bot');
          } catch (e) {
              btn.textContent = 'Failed — try Contact tab';
          }
          btn.disabled = false;
      });
  }

  function getBotResponse(input) {
      const t = input;

      if (/^(1|2|3|4|one|two|three|four|friend|professor|recruiter|other)$/.test(t.replace(/\s/g, ''))) {
          const map = { 1: 'friend', 2: 'professor', 3: 'recruiter', 4: 'other', one: 'friend', two: 'professor', three: 'recruiter', four: 'other' };
          visitorType = map[t] || t;
          return "Thanks! I'll tailor responses for you as a " + visitorType + ".";
      }
      if (/\b(color picker|pick color|choose color|color wheel|select color)\b/.test(t)) {
          showColorPicker();
          return null;
      }
      if (/\b(suggestion|advice|improve|feedback|recommendation|what should i improve|areas to improve)\b/.test(t)) {
          showSuggestionForm();
          return null;
      }

      // --- Website controls (dark/light, media, colors) ---
      if (/\b(dark|dark mode|dark theme|switch to dark|turn on dark)\b/.test(t)) {
          document.body.classList.add('dark-mode');
          return "Dark mode is on. The page is now using a dark theme.";
      }
      if (/\b(light|bright|light mode|bright mode|light theme|switch to light|turn on light)\b/.test(t)) {
          document.body.classList.remove('dark-mode');
          return "Light mode is on. The page is now using a bright theme.";
      }
      if (/\b(toggle theme|switch theme|flip theme)\b/.test(t)) {
          document.body.classList.toggle('dark-mode');
          return document.body.classList.contains('dark-mode') ? "Switched to dark mode." : "Switched to light mode.";
      }

      const videoEl = document.getElementById('pageVideo');
      const audioEl = document.getElementById('pageAudio');
      if (videoEl && /\b(play video|start video|play the video)\b/.test(t)) {
          videoEl.play().catch(() => {});
          return "Playing the video in the Entertainment section.";
      }
      if (videoEl && /\b(stop video|pause video|stop the video)\b/.test(t)) {
          videoEl.pause();
          return "Video paused.";
      }
      if (audioEl && /\b(play music|play audio|start music|start the music)\b/.test(t)) {
          audioEl.play().catch(() => {});
          return "Playing background music.";
      }
      if (audioEl && /\b(stop music|pause music|stop audio|mute music)\b/.test(t)) {
          audioEl.pause();
          return "Music paused.";
      }

      const root = document.documentElement;
      if (/\b(change color|change accent|set color|accent)\b/.test(t)) {
          const blue = t.includes('blue') || !t.match(/red|green|purple|orange|teal/);
          const green = t.includes('green');
          const red = t.includes('red');
          const purple = t.includes('purple');
          const orange = t.includes('orange');
          const teal = t.includes('teal');
          const hex = green ? '#27ae60' : red ? '#e74c3c' : purple ? '#9b59b6' : orange ? '#e67e22' : teal ? '#1abc9c' : '#3498db';
          root.style.setProperty('--accent', hex);
          root.style.setProperty('--primary', hex);
          return "Theme color updated. Try refreshing if buttons don’t match.";
      }
      if (/\b(change background|set background|page background|background color)\b/.test(t)) {
          const dark = t.includes('dark') || t.includes('gray') || t.includes('grey');
          const light = t.includes('light') || t.includes('white');
          if (dark) {
              root.style.setProperty('--bg-color', '#1a1d23');
              document.body.classList.add('dark-mode');
              return "Background set to dark.";
          }
          if (light) {
              root.style.setProperty('--bg-color', '#f4f7f6');
              document.body.classList.remove('dark-mode');
              return "Background set to light.";
          }
          root.style.setProperty('--bg-color', '#f4f7f6');
          return "Background reset. Say 'dark background' or 'light background' for a specific look.";
      }
      if (/\b(reset color|reset theme|default color|default theme)\b/.test(t)) {
          root.style.removeProperty('--accent');
          root.style.removeProperty('--primary');
          root.style.removeProperty('--bg-color');
          document.body.classList.remove('dark-mode');
          return "Theme and colors reset to default.";
      }

      // --- Education / GPA / Coursework ---
      if (t.includes('gpa')) return "Gaurab has a cumulative GPA of 3.7.";
      if (t.includes('course') || t.includes('coursework') || t.includes('classes')) return "Relevant coursework: Computer Programming I & II, Calculus I, UI/UX Human-centred Design, Database Management System, Data Structures, Fundamentals of MIS, Operating System, Windows Programming, Front-end Development.";
      if (t.includes('education') || t.includes('university')) return "He is studying at Caldwell University, Class of 2028 — Bachelor of Science in Computer Science & Business Analytics. Coursework includes: Programming I/II, Data Structures, DBMS, UI/UX, Front-end Dev, Operating System, and more. See the Education tab for the full list.";

      // --- Priorities: projects, skills, leadership, contact ---
      if (/\b(project|projects)\b/.test(t)) return getProjectsResponse();
      if (/\b(skill|skills)\b/.test(t)) return getSkillsResponse();
      if (/\b(leadership|lead|experience)\b/.test(t)) return getLeadershipResponse();
      if (/\b(community|crits|askmattrab|volunteer)\b/.test(t)) return getCommunityResponse();
      if (/\b(contact|email|phone|reach|hire)\b/.test(t)) return getContactResponse();
      if (/\b(game|games|play)\b/.test(t)) return getGamesResponse();
      if (/\b(movie|movies|series|show|recommend)\b/.test(t)) return "Tech/career themed: Silicon Valley (HBO), Mr. Robot, The Social Network. Fun: Brooklyn Nine-Nine, The Office, Black Mirror.";

      if (/\b(help|what can you|commands)\b/.test(t)) return "I can: switch dark/light mode, play video/music, use color picker (say 'color picker'), change accent/background. Ask about projects, skills, leadership, community, contact, GPA, education, coursework, games, or movie recommendations. Say 'suggestion' to share professional feedback for Gaurab. Click 'Who are you?' to set your visitor type.";
      return "Ask me about projects, skills, leadership, contact, GPA, or say 'color picker', 'dark mode', 'play music' to control the site.";
  }

  function getProjectsResponse() {
      const all = "Chef On Call (Figma UI/UX), Python Hourly Work Tracker, Portfolio Website (this site with games & chatbot), Data Analytics Dashboard (placeholder), API Integration Tool (placeholder). Check the Projects tab for links.";
      const top3 = "Top projects: 1) Chef On Call — Figma UI/UX design. 2) Python Hourly Work Tracker — GUI for shift tracking. 3) This portfolio — interactive games, chatbot. Community: The Crits, Askmattrab. Contact: ggiri@caldwell.edu. Resume: use the Download button above.";
      const research = "Projects: Chef On Call (UI/UX), Python Work Tracker, this portfolio. Community: The Crits (youth digital literacy), Askmattrab (math education). Leadership: SGA Senator, Peer Tutor, Orientation Leader.";
      const other = "Projects: Chef On Call, Python Work Tracker, this portfolio, Data Analytics Dashboard and API Integration Tool (in progress). Skills: Python, C, JavaScript, SQL, Git, Docker, Excel, PowerBI. Community: The Crits, Askmattrab. Leadership: SGA Senator, Peer Tutor.";
      switch (visitorType) {
          case 'friend': return all + " Fun stuff first: try Snake, Memory Match, Typing games in Entertainment! Free games: itch.io, coolmathgames.com, tetris.com.";
          case 'recruiter': return top3;
          case 'professor': return research;
          default: return other;
      }
  }
  function getSkillsResponse() {
      const full = "Programming: Python, C, JavaScript, SQL, HTML/CSS, C#. Database: MySQL, Apache. Tools: Git, GitHub, Docker. Data: Excel, PowerBI.";
      const recruiter = "Most relevant: Python, C, JavaScript, SQL, HTML/CSS, C#, Git, Docker, Excel, PowerBI. Contact: ggiri@caldwell.edu.";
      const prof = "Programming: Python, C, JavaScript, SQL, C#. Database: MySQL. Tools: Git, Docker. Data: Excel, PowerBI. Leadership: SGA Senator, Peer Tutor, The Crits.";
      switch (visitorType) {
          case 'recruiter': return recruiter;
          case 'professor': return prof;
          default: return full;
      }
  }
  function getLeadershipResponse() {
      const text = "Orientation Leader (campus tours, freshmen support), Peer Tutor at Academic Success Center (study plans), SGA Senator (student initiatives) at Caldwell University. Community: Secretary of The Crits (youth digital literacy), Creator of Askmattrab (math education).";
      return visitorType === 'recruiter' ? "Leadership: Orientation Leader, Peer Tutor, SGA Senator. Community: The Crits, Askmattrab. Contact: ggiri@caldwell.edu." : text;
  }

  function getCommunityResponse() {
      const text = "The Crits (2023–Present): Co-founded national initiative for youth digital literacy and career counseling. Delivered workshops to 1,000+ students across Nepal. Askmattrab (2023–Present): Creator — math problems, solutions, and instructional materials for advanced problem-solving. See the Community tab for details.";
      return text;
  }
  function getContactResponse() {
      const full = "Email: ggiri@caldwell.edu | Phone: 862-459-4545 | Caldwell, NJ. LinkedIn & GitHub in the header. Use the Contact tab to send a message.";
      return visitorType === 'recruiter' ? "Email: ggiri@caldwell.edu | Phone: 862-459-4545 | LinkedIn & GitHub in header | Download Resume at top | Contact tab for form." : full;
  }
  function getGamesResponse() {
      const site = "On this site: Snake, Higher or Lower, Memory Match, Typing Speed Test — all in the Entertainment tab.";
      const links = " Free games: itch.io, coolmathgames.com, tetris.com, poki.com.";
      return visitorType === 'friend' ? site + links : site;
  }

  // 3. Optimized Snake Game
  const canvas = document.getElementById("snakeGame");
  const ctx = canvas.getContext("2d");
  const startBtn = document.getElementById("startGame");
  const scoreEl = document.getElementById("score");

  let box = 20;
  let snake, food, d, nextD, gameScore, game;

  function initGame() {
      snake = [{ x: 7 * box, y: 7 * box }];
      food = { x: Math.floor(Math.random() * 14) * box, y: Math.floor(Math.random() * 14) * box };
      d = nextD = null;
      gameScore = 0;
      scoreEl.innerText = gameScore;
  }

  // Prevent opposite direction turns (prevents self-collision on instant double-press)
  document.addEventListener("keydown", (e) => {
      if (e.keyCode == 37 && d != "RIGHT") nextD = "LEFT";
      else if (e.keyCode == 38 && d != "DOWN") nextD = "UP";
      else if (e.keyCode == 39 && d != "LEFT") nextD = "RIGHT";
      else if (e.keyCode == 40 && d != "UP") nextD = "DOWN";
  });

  function draw() {
      d = nextD;
      ctx.fillStyle = "#2c3e50";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < snake.length; i++) {
          ctx.fillStyle = (i == 0) ? "#3498db" : "#ecf0f1";
          ctx.fillRect(snake[i].x, snake[i].y, box, box);
      }

      ctx.fillStyle = "#e74c3c";
      ctx.fillRect(food.x, food.y, box, box);

      let snakeX = snake[0].x;
      let snakeY = snake[0].y;

      if (d == "LEFT") snakeX -= box;
      if (d == "UP") snakeY -= box;
      if (d == "RIGHT") snakeX += box;
      if (d == "DOWN") snakeY += box;

      if (snakeX == food.x && snakeY == food.y) {
          gameScore++;
          scoreEl.innerText = gameScore;
          food = { x: Math.floor(Math.random() * 14) * box, y: Math.floor(Math.random() * 14) * box };
      } else if (d) {
          snake.pop();
      }

      let newHead = { x: snakeX, y: snakeY };

      if (d && (snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height || collision(newHead, snake))) {
          clearInterval(game);
          alert("Game Over! Score: " + gameScore);
          initGame();
          return;
      }
      if (d) snake.unshift(newHead);
  }

  function collision(head, array) {
      for (let i = 0; i < array.length; i++) {
          if (head.x == array[i].x && head.y == array[i].y) return true;
      }
      return false;
  }

  startBtn.addEventListener('click', () => {
      clearInterval(game);
      initGame();
      game = setInterval(draw, 100); // Increased speed for smoothness
  });

  // 4. Higher or Lower Game Logic
  let currentNum = 50;
  let streak = 0;
  window.guess = (direction) => {
    const nextNum = Math.floor(Math.random() * 100) + 1;
    if ((direction === 'higher' && nextNum > currentNum) || (direction === 'lower' && nextNum < currentNum)) {
        streak++;
        alert(`Correct! It was ${nextNum}.`);
    } else {
        streak = 0;
        alert(`Wrong! It was ${nextNum}.`);
    }
    currentNum = nextNum;
    document.getElementById('currentNum').innerText = currentNum;
    document.getElementById('guessScore').innerText = streak;
  };

  // 5. Memory Match Game
  const MEMORY_ICONS = ['★','◆','●','■','▲','♥','♦','♣'];
  let memoryCards = [], flipped = [], moves = 0, lock = false;

  function createMemoryBoard() {
    const board = document.getElementById('memoryBoard');
    const movesEl = document.getElementById('memoryMoves');
    if (!board) return;
    let pairs = MEMORY_ICONS.slice(0, 4).flatMap(i => [i, i]);
    pairs = pairs.sort(() => Math.random() - 0.5);
    board.innerHTML = '';
    flipped = [];
    moves = 0;
    movesEl.textContent = '0';
    lock = false;
    memoryCards = pairs.map((icon, i) => ({
      id: i,
      icon,
      el: (() => {
        const div = document.createElement('div');
        div.className = 'memory-card';
        div.dataset.id = i;
        div.textContent = '?';
        div.addEventListener('click', () => flipCard(i));
        return div;
      })()
    }));
    memoryCards.forEach(c => board.appendChild(c.el));
  }

  function flipCard(id) {
    if (lock || flipped.length >= 2) return;
    const card = memoryCards[id];
    if (card.el.classList.contains('flipped') || card.el.classList.contains('matched')) return;
    card.el.classList.add('flipped');
    card.el.textContent = card.icon;
    flipped.push(card);
    if (flipped.length === 2) {
      moves++;
      document.getElementById('memoryMoves').textContent = moves;
      lock = true;
      if (flipped[0].icon === flipped[1].icon) {
        flipped.forEach(c => c.el.classList.add('matched'));
        flipped = [];
        lock = false;
        if (document.querySelectorAll('.memory-card.matched').length === memoryCards.length) {
          setTimeout(() => alert(`You won in ${moves} moves!`), 200);
        }
      } else {
        setTimeout(() => {
          flipped.forEach(c => {
            c.el.classList.remove('flipped');
            c.el.textContent = '?';
          });
          flipped = [];
          lock = false;
        }, 600);
      }
    }
  }

  document.getElementById('memoryStart')?.addEventListener('click', createMemoryBoard);
  createMemoryBoard();

  // 6. Typing Speed Test
  const TYPING_QUOTES = [
    'The quick brown fox jumps over the lazy dog.',
    'JavaScript is the language of the web and interactive applications.',
    'Practice makes perfect when it comes to typing speed and accuracy.'
  ];
  let typingStartTime = null;

  const typingQuoteEl = document.getElementById('typingQuote');
  const typingInputEl = document.getElementById('typingInput');
  const typingStartBtn = document.getElementById('typingStart');
  const typingWpmEl = document.getElementById('typingWpm');

  if (typingStartBtn && typingQuoteEl && typingInputEl && typingWpmEl) {
    typingStartBtn.addEventListener('click', () => {
      const quote = TYPING_QUOTES[Math.floor(Math.random() * TYPING_QUOTES.length)];
      typingQuoteEl.textContent = quote;
      typingInputEl.value = '';
      typingInputEl.disabled = false;
      typingInputEl.focus();
      typingWpmEl.textContent = '—';
      typingStartTime = Date.now();
      typingInputEl.classList.remove('correct', 'wrong');
    });

    typingInputEl.addEventListener('input', () => {
      const quote = typingQuoteEl.textContent;
      const val = typingInputEl.value;
      if (quote.startsWith(val)) typingInputEl.classList.add('correct'), typingInputEl.classList.remove('wrong');
      else typingInputEl.classList.add('wrong'), typingInputEl.classList.remove('correct');
      if (val === quote && typingStartTime) {
        typingInputEl.disabled = true;
        const minutes = (Date.now() - typingStartTime) / 60000;
        const words = quote.trim().split(/\s+/).length;
        const wpm = Math.round(words / minutes);
        typingWpmEl.textContent = wpm;
      }
    });
  }

  // 7. Weather Integration
  async function fetchWeather() {
      try {
          const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=40.8384&longitude=-74.2789&current_weather=true');
          const data = await res.json();
          document.getElementById('temp-data').innerText = `${data.current_weather.temperature}°C in Caldwell, NJ`;
      } catch (e) {
          document.getElementById('temp-data').innerText = "Caldwell, NJ: 18°C (Estimated)";
      }
  }

  // 8. Contact Form — sends to your email via Formspree
  const RATE_LIMIT_MS = 10 * 60 * 1000; // 10 minutes

  const contactForm = document.getElementById('contactForm');
  contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button');
      const lastSubmit = parseInt(localStorage.getItem('contactFormLastSubmit') || '0', 10);

      if (Date.now() - lastSubmit < RATE_LIMIT_MS) {
          const waitMins = Math.ceil((RATE_LIMIT_MS - (Date.now() - lastSubmit)) / 60000);
          btn.innerText = `Limit: 1 per 10 min. Wait ${waitMins} min.`;
          btn.style.background = '#e74c3c';
          setTimeout(() => {
              btn.innerText = 'Send Message';
              btn.style.background = '';
          }, 4000);
          return;
      }

      const formData = new FormData(contactForm);
      const body = Object.fromEntries(formData.entries());
      body._subject = `Portfolio Contact: ${body.subject || 'Inquiry'}`;

      if (FORMSPREE_ENDPOINT.includes('YOUR_FORMSPREE_ID')) {
          btn.innerText = 'Form not configured (see script.js)';
          btn.style.background = '#e67e22';
          setTimeout(() => { btn.innerText = 'Send Message'; btn.style.background = ''; }, 3000);
          return;
      }

      btn.disabled = true;
      btn.innerText = 'Sending...';

      try {
          const res = await fetch(FORMSPREE_ENDPOINT, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body)
          });
          if (!res.ok) throw new Error('Send failed');
          localStorage.setItem('contactFormLastSubmit', String(Date.now()));
          btn.innerText = 'Sent Successfully!';
          btn.style.background = '#27ae60';
          contactForm.reset();
      } catch (err) {
          btn.innerText = 'Failed — try again';
          btn.style.background = '#e74c3c';
      }
      btn.disabled = false;
      setTimeout(() => {
          btn.innerText = 'Send Message';
          btn.style.background = '';
      }, 3000);
  });

  initGame();
  fetchWeather();
});
