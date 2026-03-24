document.write(`


  <nav>

  <div class="nav-left">
    <a href="/WebsiteGit/index.html">Home</a>

    <div class="dropdown">
      <span>Pages ▾</span>
        <div class="dropdown-content">
          <div style="position:relative; left:5px">
            Meca
            <a href="/WebsiteGit/Meca/Meca.html">Stationnary points</a>
          </div>
          <div style="position:relative; left:5px">
            Langragian mechanics
            <a href="/WebsiteGit/Lagrangian/Brachistochrone.html">Brachistochrone</a>
            <a href="/WebsiteGit/Lagrangian/Catenary.html">Catenary</a>
          </div>
          <div style="position:relative; left:5px">
            Other
            <a href="/WebsiteGit/Hydrogen/Hydrogen.html">Hydrogen atom</a>
          </div>
          
          
        </div>
      </div>
    </div>

    <div class="nav-left">
      <a href="/WebsiteGit/index.html">About</a>
      <div class="toggle-switch" id="toggleSwitch">

        <div class="toggle-icon-moon"></div>

        <svg class="toggle-icon-sun" width="16" height="16" viewBox="0 0 16 16">
          <!-- center circle -->
          <circle cx="8" cy="8" r="2.5" fill="currentColor"/>
          <!-- rays -->
          <line x1="8" y1="0.5" x2="8" y2="3.5"   stroke="currentColor" stroke-width="1.2"/>
          <line x1="8" y1="12.5" x2="8" y2="15.5" stroke="currentColor" stroke-width="1.2"/>
          <line x1="0.5" y1="8" x2="3.5" y2="8"   stroke="currentColor" stroke-width="1.2"/>
          <line x1="12.5" y1="8" x2="15.5" y2="8" stroke="currentColor" stroke-width="1.2"/>
          <!-- diagonal rays -->
          <line x1="2.5" y1="2.5" x2="4.5" y2="4.5"     stroke="currentColor" stroke-width="1.2"/>
          <line x1="11.5" y1="11.5" x2="13.5" y2="13.5" stroke="currentColor" stroke-width="1.2"/>
          <line x1="11.5" y1="4.5" x2="13.5" y2="2.5"   stroke="currentColor" stroke-width="1.2"/>
          <line x1="2.5" y1="13.5" x2="4.5" y2="11.5"   stroke="currentColor" stroke-width="1.2"/>
        </svg>

        <div class="toggle-circle"></div>

      </div>
    </div>
    
  </nav>



<style>
  nav {
    background-color: #2196F3;
    padding: 10px;
    justify-content: space-between;
    display: flex;
  }

  .nav-right {
    padding-left: 15px;
    padding-right: 15px;
    display: flex;
    gap: 15px;
  }

  .nav-left {
    padding-left: 15px;
    padding-right: 15px;
    display: flex;
    gap: 15px;
  }

  nav a {
    color: white;
    text-decoration: none;
    font-family: 'CMU Serif', serif;
  }

  nav a:hover {
    color: lightblue;
  }


  .dropdown-content {
    display: none;
    position: absolute;
    background-color: rgb(33, 150, 243);
    min-width: 150px;
    top: 100%;
    padding-top: 10px;
    z-index: 1000;
  }

  .dropdown-content a {
    display: block;
    padding: 8px 12px;
  }

  .dropdown:hover .dropdown-content {
    display: block;
  }

  .dropdown {
    position: relative;
  }

</style>


<script>
    // const toggleSwitch = document.getElementById('toggleSwitch');
    // // const status = document.getElementById('status');
    // const body = document.body;
    // let isDark = false;

    // toggleSwitch.addEventListener('click', function() {
    //     isDark = !isDark;
    //     toggleSwitch.classList.toggle('active');
    //     body.classList.toggle('dark-theme');
    // });

  const toggleSwitch = document.getElementById('toggleSwitch');
  const body = document.body;

  // Restore saved preference on every page load
  let isDark = localStorage.getItem('theme') === 'dark';
  if (isDark) {
    toggleSwitch.classList.add('active');
    body.classList.add('dark-theme');
  }

  // Save preference on toggle
  toggleSwitch.addEventListener('click', function() {
    isDark = !isDark;
    toggleSwitch.classList.toggle('active');
    body.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
</script>

<style>
  .toggle-switch {
    position: relative;
    width: 48px;
    height: 24px;
    background-color: var(--text-color);
    border-radius: 24px;
    cursor: pointer;
    transition: background-color 0.3s;
    display: inline-block;
  }

  .toggle-switch.active {
    background-color: var(--text-color);
  }
  

  .toggle-circle {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background-color: var(--bg-color);
    border-radius: 50%;
    transition: transform 0.3s;
    // box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  .toggle-icon-moon {
    position: absolute;
    top: 2px;
    right: 8px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: var(--text-color);
    box-shadow: 2px 2px 0px 0px var(--bg-color);

    transition: background 0.3s;
  }
  
  .toggle-icon-sun {
    position: absolute;
    top: 4px;
    left: 4px;
    color : var(--text-color);
  }

  .toggle-switch.active .toggle-circle {
    transform: translateX(24px);
  }
  .toggle-switch.active .toggle-icon-moon {
    background-color: var(--text-color);
  }
  .toggle-switch.active .toggle-icon-sun {
    color: var(--bg-color);
  }
</style>


`);