const assert = require("node:assert/strict");
const { test } = require("node:test");
require("../engine/questionnaires.js");
require("../engine/matching.js");
require("../fixtures.js");
const { reportFor, artist, venue } = FirstPatch.fixture;
const finding = (report, id) =>
  report.findings.find((entry) => entry.id === id);
test("the default room lacks one requested mix and has no direct boxes listed", () => {
  const report = reportFor();
  assert.equal(report.gaps, 2);
  assert.equal(finding(report, "monitors").status, "gap");
  assert.equal(finding(report, "gear-dis").status, "gap");
  assert.match(finding(report, "gear-dis").evidence, /Stereo keys: 2 DIs/);
});
test("adding monitor supply closes only the monitor gap", () => {
  const report = reportFor("three_four");
  assert.equal(report.gaps, 1);
  assert.equal(finding(report, "monitors").status, "covered");
  assert.equal(finding(report, "gear-dis").status, "gap");
});
test("listing direct boxes changes the supplier action without inventing quantities", () => {
  const report = reportFor("three_four", true);
  assert.equal(report.gaps, 0);
  assert.equal(finding(report, "gear-dis").status, "confirm");
  assert.equal(finding(report, "gear-dis").owner, "Venue");
  assert.match(finding(report, "gear-dis").action, /quantity/);
  assert.equal(
    report.covered + report.gaps + report.confirm,
    report.findings.length,
  );
  assert.equal(reportFor().gaps, 2);
});
test("incomplete or swapped profiles are rejected", () => {
  assert.throws(
    () => FirstPatch.match.matchProfiles(venue, artist),
    /one artist and one venue/,
  );
  assert.throws(
    () => FirstPatch.match.matchProfiles({ ...artist, status: "draft" }, venue),
    /Complete both/,
  );
});
