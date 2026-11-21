var q = new URLSearchParams(location.search);
var title = document.getElementById("title");
var text = document.getElementById("text");

if (q.get("reason") === "time") {
  var until = new Date(Number(q.get("until")));
  title.textContent = "Time's up on that thread";
  text.textContent = isNaN(until)
    ? "It's locked for now."
    : "It opens again at " + until.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) + ".";
} else {
  title.textContent = "Reddit is blocked";
  text.textContent =
    "You can still open a thread from a link outside Reddit, like a Google result, " +
    "for " + REDDIT_THREAD_MINUTES + " minutes at a time.";
}
