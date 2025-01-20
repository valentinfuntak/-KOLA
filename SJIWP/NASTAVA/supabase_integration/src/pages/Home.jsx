import { Show, createEffect, createSignal } from "solid-js";
import { A } from "@solidjs/router";
import { useAuth } from "../components/AuthProvider";
import { supabase } from "../services/supabase";

export default function Home(props) {
    const session = useAuth();

    const [projects, setProjects] = createSignal(null);

    createEffect(async () => {
        if (session()) {
            const { data, error } = await supabase
                .from("projects")
                .select()
            if (!error) {
                setProjects(data);
            }
        }
    });

    return (
        <>
            <Show when={!session()}>
                <div class="bg-red-400 text-white text-3xl p-10 rounded">
                    Morate se prijaviti da biste vidjeli projekte!
                </div>
            </Show>
            <Show when={session() && projects()}>
                <For each={projects()} fallback={<div>Nema projekata.</div>}>
                    {(item) => <div class="flex flex-col gap-2 items-end bg-slate-600 text-white p-2 rounded mb-5">
                        <div class="place-self-start text-xl">{item.name}</div>
                        <A href={`/tasks/${item.id}`} class="bg-indigo-600 text-white p-2 rounded text-sm">
                            Prikaži
                        </A>
                    </div>}
                </For>
            </Show>
        </>
    );

}