import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


serve(async () => {

    try {

        // -----------------------------
        // Supabase 接続
        // -----------------------------

        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );


        // -----------------------------
        // Resend API Key
        // -----------------------------

        const resendApiKey =
            Deno.env.get("RESEND_API_KEY");


        // -----------------------------
        // 日付範囲計算
        // 先月16日 ～ 今月15日
        // -----------------------------

        const now = new Date();

        const endDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            15,
            23,
            59,
            59
        );

        const startDate = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            16,
            0,
            0,
            0
        );


        // ISO文字列化
        const startIso = startDate.toISOString();

        const endIso = endDate.toISOString();


        // -----------------------------
        // DB取得
        // -----------------------------

        const { data, error } =
            await supabase
                .from("agendas")
                .select("*")
                .gte("created_at", startIso)
                .lte("created_at", endIso)
                .order("created_at", {
                    ascending: true
                });

        if (error) {

            console.error(error);

            return new Response(
                JSON.stringify(error),
                {
                    status: 500
                }
            );
        }


        // -----------------------------
        // HTML生成
        // -----------------------------

        let html = `
        <h1>月次議題一覧</h1>

        <p>
        対象期間：
        ${startIso}
        ～
        ${endIso}
        </p>
        `;

        if (!data || data.length === 0) {

            html += `
            <p>議題登録はありません。</p>
            `;
        }
        else {

            for (const row of data) {

                html += `
                <hr>

                <p>
                <strong>登録日時：</strong>
                ${row.created_at}
                </p>

                <p>
                <strong>事業所：</strong>
                ${row.office}
                </p>

                <p>
                <strong>登録者：</strong>
                ${row.author}
                </p>

                <p>
                <strong>議題：</strong>
                </p>

                <pre>${row.body}</pre>
                `;
            }
        }


        // -----------------------------
        // Resend送信
        // -----------------------------

        const resendResponse =
            await fetch(
                "https://api.resend.com/emails",
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            `Bearer ${resendApiKey}`,

                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        from:
                            "onboarding@resend.dev",

                        to: [
                            "niiyama@shinmina.care"
                        ],

                        subject:
                            "月次議題一覧",

                        html: html
                    })
                }
            );


        const resendResult =
            await resendResponse.json();


        console.log(resendResult);


        // -----------------------------
        // 完了
        // -----------------------------

        return new Response(
            JSON.stringify({
                success: true,
                count: data?.length ?? 0
            }),
            {
                headers: {
                    "Content-Type":
                        "application/json"
                }
            }
        );

    }
    catch (err) {

        console.error(err);

        return new Response(
            JSON.stringify(err),
            {
                status: 500
            }
        );
    }
});