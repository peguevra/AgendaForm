const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const form = document.getElementById("agendaForm");

const message = document.getElementById("message");

const meetingInfo = document.getElementById("meetingInfo");

const submitButton =
    document.getElementById("submitButton");


// ----------------------
// 会議月表示
// ----------------------

const today = new Date();

let targetYear = today.getFullYear();

let targetMonth = today.getMonth() + 1;

const day = today.getDate();

if (day >= 16) {

    targetMonth += 1;

    if (targetMonth > 12) {

        targetMonth = 1;

        targetYear += 1;
    }
}

meetingInfo.textContent =
    `${targetYear}年${targetMonth}月会議にて議題になります`;


// ----------------------
// 登録処理
// ----------------------

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    // 二重送信防止
    submitButton.disabled = true;

    message.className = "message-loading";

    message.textContent =
        "登録中...";

    const office =
        document.getElementById("office")
        .value
        .trim();

    const author =
        document.getElementById("author")
        .value
        .trim();

    const body =
        document.getElementById("body")
        .value
        .trim();

    // 念のため空文字対策
    if (!office || !author || !body) {

        message.className =
            "message-error";

        message.textContent =
            "入力内容を確認してください";

        submitButton.disabled = false;

        return;
    }

    const { error } =
        await supabaseClient
            .from("agendas")
            .insert([
                {
                    office: office,
                    author: author,
                    body: body
                }
            ]);

    if (error) {

        console.error(error);

        message.className =
            "message-error";

        message.textContent =
            "登録失敗";

        submitButton.disabled = false;

        return;
    }

    message.className =
        "message-success";

    message.textContent =
        "登録完了";

    form.reset();

    submitButton.disabled = false;

});