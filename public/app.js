document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".read-more").forEach((button) => {
      button.addEventListener("click", function () {
        let card = this.closest(".card");
        card.classList.toggle("h-[100px]");
        card.classList.toggle("h-50");
       card.querySelector(".desc").classList.toggle("hidden");
       card.querySelector(".read-more").classList.toggle("hidden");
      });
    });
  });