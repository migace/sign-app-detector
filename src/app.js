import { brain } from "brain.js";

import "./components/drawable-box.js";
import "./style.css";

const tempTrainData = {};
const trainData = [];
const positiveSigns = ["positive-one", "positive-two", "positive-three"];
const negativeSigns = ["negative-one", "negative-two", "negative-three"];
const net = new brain.NeuralNetwork();

document.addEventListener("my-event", (ev) => {
  tempTrainData[ev.detail.id] = ev.detail.vector;

  if (
    positiveSigns.every((item) => Object.keys(tempTrainData).includes(item)) &&
    negativeSigns.every((item) => Object.keys(tempTrainData).includes(item))
  ) {
    document.getElementById("train").disabled = false;
  }
});

document.getElementById("train").addEventListener("click", train);
document.getElementById("guess").addEventListener("click", guess);
document
  .getElementById("reset")
  .addEventListener("click", () => window.location.reload());

function train() {
  trainData.push({
    input: tempTrainData["positive-one"],
    output: { positive: 1 },
  });
  trainData.push({
    input: tempTrainData["positive-two"],
    output: { positive: 1 },
  });
  trainData.push({
    input: tempTrainData["positive-three"],
    output: { positive: 1 },
  });
  trainData.push({
    input: tempTrainData["negative-one"],
    output: { negative: 1 },
  });
  trainData.push({
    input: tempTrainData["negative-two"],
    output: { negative: 1 },
  });
  trainData.push({
    input: tempTrainData["negative-three"],
    output: { negative: 1 },
  });

  const result = net.train(trainData, { log: true });

  document.getElementById("result-net").innerHTML = `iterations: ${
    result.iterations
  }, <br />error: ${result.error.toFixed(6)}`;
  document.getElementById("result-net-wrapper").style.display = "block";
  document.getElementById("guess").disabled = false;
}

function guess() {
  const result = brain.likely(tempTrainData["custom"], net);

  document.getElementById("result").innerHTML = `Result: <b>${result}</b>`;
  document.getElementById("result-wrapper").style.display = "block";
}
