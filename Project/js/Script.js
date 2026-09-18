document.querySelectorAll(".specialLink").forEach(function(link) {
	link.addEventListener("click", function(event) {
		if (event.ctrlKey) {
			event.preventDefault();
			window.location.href = "/html/secret.html";
		}
	});
});
