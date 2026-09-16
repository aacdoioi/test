document.getElementById("specialLink").addEventListener("click", function(event) {
	if (event.ctrlKey) {
		event.preventDefault();
		window.location.href = "/html/secret.html";
	}
});
