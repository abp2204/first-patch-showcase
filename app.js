(() => {
  const mixes = document.querySelector("#mixes");
  const inventory = document.querySelector("#dis");
  const statusLabels = { gap: "Gap", covered: "Covered", confirm: "Confirm" };
  const ownerLabels = {
    Both: "Artist + venue",
    Venue: "Venue",
    Artist: "Artist",
  };
  function make(tag, className, text) {
    const element = document.createElement(tag);
    element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function findingCard(finding) {
    const item = make("article", "check");
    item.dataset.finding = finding.id;
    const head = make("div", "findhead");
    head.append(
      make("h3", "", finding.title),
      make("span", "status " + finding.status, statusLabels[finding.status]),
    );
    const action = make("p", "action");
    action.append(
      make("span", "owner", ownerLabels[finding.owner]),
      document.createTextNode(finding.action),
    );
    item.append(head, make("p", "evidence", finding.evidence), action);
    return item;
  }
  function render() {
    const report = FirstPatch.fixture.reportFor(mixes.value, inventory.checked);
    const counts = document.querySelector("#counts");
    counts.replaceChildren(
      make(
        "span",
        "count gap",
        report.gaps + (report.gaps === 1 ? " gap" : " gaps"),
      ),
      make("span", "count confirm", report.confirm + " to confirm"),
      make("span", "count covered", report.covered + " covered"),
    );
    const highlights = new Set(["monitors", "gear-dis"]);
    const rest = report.findings.filter((f) => !highlights.has(f.id));
    document
      .querySelector("#priority")
      .replaceChildren(
        ...report.findings.filter((f) => highlights.has(f.id)).map(findingCard),
      );
    document.querySelector("#others").replaceChildren(...rest.map(findingCard));
    document.querySelector("#other-count").textContent =
      "(" + rest.length + ")";
    const supplied = { one_mix: 1, two_mixes: 2, three_four: 3, five_plus: 5 }[
      mixes.value
    ];
    const requested = Number(
      FirstPatch.fixture.artist.answers.monitor_mix_count,
    );
    document.querySelectorAll(".line").forEach((row, i) => {
      row.classList.toggle("open", i >= supplied);
      row.lastElementChild.textContent =
        i >= supplied ? "Open" : "Out 0" + (i + 1);
    });
    const routed = Math.min(supplied, requested);
    document
      .querySelector("#rack")
      .setAttribute(
        "aria-label",
        "Monitor patch. " +
          routed +
          " of " +
          requested +
          " requested mixes can be supplied.",
      );
  }
  mixes.addEventListener("change", render);
  inventory.addEventListener("change", render);
  render();
})();
