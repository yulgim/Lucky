document.getElementById("horoscope-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const gender = document.getElementById("gender").value;
    const birthdate = document.getElementById("birthdate").value;

    const response = await fetch("/api/horoscope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gender, birthdate }),
    });

    const data = await response.json();
    document.getElementById("fortune_name").innerText = data.nameFortune || "운세의 이름을 불러오는데 실패했습니다.";
    document.getElementById("fortune_detail").innerText = data.detailFortune || "운세의 내용을 불러오는데 실패했습니다.";
});
