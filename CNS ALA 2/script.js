const grid = document.getElementById("pcGrid");
const svg = document.getElementById("links");
const countLabel = document.getElementById("affectedCount");
const affectedHint = document.getElementById("affectedHint");
const activeThreat = document.getElementById("activeThreat");
const demoStatus = document.getElementById("demoStatus");
const reportSubtitle = document.getElementById("reportSubtitle");
const reportBadge = document.getElementById("reportBadge");
const reportSymbol = document.getElementById("reportSymbol");
const reportTitle = document.getElementById("reportTitle");
const reportText = document.getElementById("reportText");
const reportAffected = document.getElementById("reportAffected");

const links = [
  [0,1],[1,2],[2,3],[3,4],[5,6],[6,7],[7,8],[8,9],
  [10,11],[11,12],[12,13],[13,14],[0,5],[1,6],[2,7],[3,8],[4,9],
  [5,10],[6,11],[7,12],[8,13],[9,14],[1,5],[3,9],[6,10],[8,12]
];

const scenarios = {
  virus: {
    name: "Virus", symbol: "✳", count: 5, type: "affected",
    nodes: [0,1,5,6,10],
    title: "File-associated behavior",
    text: "A virus attaches to a host file or program. This visual example highlights five fictional computers to represent possible impact. It does not copy, open, or change files."
  },
  worm: {
    name: "Worm", symbol: "⌘", count: 9, type: "affected",
    nodes: [0,1,2,3,4,7,8,11,14],
    title: "Independent spread behavior",
    text: "A worm can spread between systems without attaching to a host file. This animation highlights a fictional path across nine nodes. No network connections or packets are sent."
  },
  trojan: {
    name: "Trojan", symbol: "◉", count: 1, type: "caution",
    nodes: [7],
    title: "Deceptive software behavior",
    text: "A Trojan may appear to be legitimate software while hiding harmful intent. This example marks one fictional computer as a caution. Nothing is installed or executed."
  }
};

let runId = 0;

function createPCs() {
  grid.innerHTML = "";
  for (let i = 0; i < 15; i++) {
    const pc = document.createElement("div");
    pc.className = "pc";
    pc.dataset.index = i;
    pc.innerHTML = `<span class="computer">▣</span><b>PC-${String(i + 1).padStart(2,"0")}</b><small>Normal</small>`;
    grid.appendChild(pc);
  }
  drawLinks();
}

function drawLinks() {
  svg.innerHTML = "";
  const area = document.querySelector(".network-area").getBoundingClientRect();
  [...grid.children].forEach((pc, i) => pc.dataset.index = i);
  links.forEach(([a,b]) => {
    const first = grid.children[a].getBoundingClientRect();
    const second = grid.children[b].getBoundingClientRect();
    const line = document.createElementNS("http://www.w3.org/2000/svg","line");
    line.setAttribute("x1", ((first.left + first.width/2 - area.left)/area.width)*600);
    line.setAttribute("y1", ((first.top + first.height/2 - area.top)/area.height)*350);
    line.setAttribute("x2", ((second.left + second.width/2 - area.left)/area.width)*600);
    line.setAttribute("y2", ((second.top + second.height/2 - area.top)/area.height)*350);
    line.setAttribute("class","connection");
    line.dataset.link = `${a}-${b}`;
    svg.appendChild(line);
  });
}

function resetSimulation() {
  runId++;
  [...grid.children].forEach(pc => {
    pc.className = "pc";
    pc.querySelector("small").textContent = "Normal";
  });
  svg.querySelectorAll(".connection").forEach(line => line.classList.remove("active"));
  document.querySelectorAll(".threat-button").forEach(button => button.classList.remove("chosen"));
  countLabel.innerHTML = '0 <small>/ 15</small>';
  affectedHint.textContent = "No scenario running";
  activeThreat.textContent = "None";
  demoStatus.textContent = "Ready";
  demoStatus.style.color = "";
  reportSubtitle.textContent = "Start a scenario to view its summary.";
  reportBadge.textContent = "WAITING";
  reportBadge.style.background = "";
  reportBadge.style.color = "";
  reportSymbol.textContent = "⌁";
  reportTitle.textContent = "Ready to explore";
  reportText.textContent = "Choose Virus, Worm, or Trojan to see its behavior represented on the fictional network map.";
  reportAffected.textContent = "0 / 15";
}

function runScenario(key) {
  resetSimulation();
  const thisRun = runId;
  const info = scenarios[key];
  document.querySelector(`[data-threat="${key}"]`).classList.add("chosen");
  activeThreat.textContent = info.name;
  demoStatus.textContent = "Running";
  demoStatus.style.color = "#bd812e";
  reportSubtitle.textContent = `${info.name} behavior demonstration`;
  reportBadge.textContent = "RUNNING";
  reportBadge.style.background = "#fff4e5";
  reportBadge.style.color = "#b77a2b";
  reportSymbol.textContent = info.symbol;
  reportTitle.textContent = info.title;
  reportText.textContent = info.text;
  affectedHint.textContent = "Animating fictional PC statuses…";

  info.nodes.forEach((nodeIndex, order) => {
    window.setTimeout(() => {
      if (thisRun !== runId) return;
      const pc = grid.children[nodeIndex];
      pc.classList.add(info.type);
      pc.querySelector("small").textContent = info.type === "caution" ? "Caution" : "Simulated";
      svg.querySelectorAll(".connection").forEach(line => {
        const [a,b] = line.dataset.link.split("-").map(Number);
        if (a === nodeIndex || b === nodeIndex) line.classList.add("active");
      });
      const total = document.querySelectorAll(".pc.affected, .pc.caution").length;
      countLabel.innerHTML = `${total} <small>/ 15</small>`;
      reportAffected.textContent = `${total} / 15`;
      affectedHint.textContent = `${total} fictional PC${total === 1 ? "" : "s"} highlighted`;

      if (order === info.nodes.length - 1) {
        window.setTimeout(() => {
          if (thisRun !== runId) return;
          demoStatus.textContent = "Complete";
          demoStatus.style.color = "#26996b";
          affectedHint.textContent = "Finished — fictional data only";
          reportBadge.textContent = "COMPLETE";
          reportBadge.style.background = "#e8f8ef";
          reportBadge.style.color = "#27865c";
        }, 350);
      }
    }, order * 400);
  });
}

document.querySelectorAll(".threat-button").forEach(button => {
  button.addEventListener("click", () => runScenario(button.dataset.threat));
});
document.getElementById("resetTop").addEventListener("click", resetSimulation);
document.getElementById("resetBottom").addEventListener("click", resetSimulation);
window.addEventListener("resize", drawLinks);
createPCs();
