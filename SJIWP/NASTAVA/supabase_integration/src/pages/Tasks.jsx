import { useParams, A } from "@solidjs/router";
import { onMount, Show, createSignal, For } from "solid-js";
import { useAuth } from "../components/AuthProvider";
import { supabase } from "../services/supabase";

export default function Tasks(props) {
    const params = useParams();
    const session = useAuth();

    const [project, setProject] = createSignal(null);
    const [isOwner, setOwner] = createSignal(false);
    const [tasks, setTasks] = createSignal();
    const [descriptionVisible, setDescriptionVisible] = createSignal(false);

    function toggleDescription() {
        setDescriptionVisible(old => !old);
    }

    onMount(async () => {
        //console.log(params.id);
        //console.log(session());

        const { data, error } = await supabase
            .from('projects')
            .select()
            .eq('id', params.id);

        if (error) return;

        setProject(data[0]);

        if (session().user.id === project().author_id) setOwner(true);

        //console.log(data);

        await loadTasks();
    });

    async function formSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const name = formData.get("name");

        const { error } = await supabase
            .from("tasks")
            .insert({
                name: name,
                done: false,
                project_id: project().id
            });

        if (error) {
            alert("Spreamnje nije uspjelo.");
        } else {
            await loadTasks();
            event.target.reset();
        }
    }

    async function deleteTask(taskId) {

        const { error } = await supabase
            .from("tasks")
            .delete()
            .eq("id", taskId);
        if (error) {
            alert("Operacija nije uspjela.");
        } else {
            await loadTasks();
        }
    }

    async function loadTasks() {
        const { data, error } = await supabase
            .from('tasks')
            .select()
            .eq('project_id', project().id);
        if (error) return;
        setTasks(data);
    }

    async function takeOwnership(taskId) {
        console.log(taskId);

        const { error } = await supabase
            .from('tasks')
            .update({ owner_id: session().user.id })
            .eq('id', taskId)

        if (error) {
            alert("Operacija nije uspjela.");
        } else {
            await loadTasks();
        }
    }

    async function markDone(taskId) {
        console.log(taskId);

        const { error } = await supabase
            .from('tasks')
            .update({ done: true })
            .eq('id', taskId)

        if (error) {
            alert("Operacija nije uspjela.");
        } else {
            await loadTasks();
        }
    }

    return (
        <>
            <Show when={project()}>
                <div class="text-3xl font-bold">Dobrodošli na projekt: {project().name}</div>
                <Show when={isOwner()}>
                    <div class="text-green-700">Vi ste vlasnik projekta, možete dodavati zadatke.</div>
                    <form onSubmit={formSubmit}>
                        <div class="p-2 flex flex-col gap-1">
                            <label>Zadatak</label>
                            <input type="text" name="name" required="true" placeholder="Unesite zadatak" />
                        </div>

                        <div class="p-2 flex flex-col gap-1">
                            <input type="submit" value="Pošalji" class="bg-slate-600 text-white p-2 rounded" />
                        </div>
                    </form>
                </Show>

                <div>
                    <button class="bg-indigo-600 text-white p-2 rounded text-sm mb-2" onClick={() => toggleDescription()}> Prikaži/sakrij opis</button>
                </div>
                <Show when={descriptionVisible()}>
                    <div class="mb-4">{project().description}</div>
                </Show>

                <For each={tasks()} fallback={<div class="bg-gray-300 text-black text-3xl p-10 rounded">Nema zadataka!</div>}>
                    {(item) => (
                        <div class="flex flex-col gap-2 items-end bg-slate-600 text-white p-2 rounded mb-5">
                            <div class="place-self-start text-xl text-white">{item.name}</div>
                            <Show when={item.owner_id}>

                            </Show>
                            <Show when={!item.owner_id}>
                                <button
                                    on:click={() => takeOwnership(item.id)}
                                    class="bg-indigo-600 text-white p-2 rounded text-sm">
                                    Preuzmi
                                </button>
                            </Show>
                            <Show when={isOwner() && item.done !== true}>
                                <button onClick={() => deleteTask(item.id)} class="bg-red-600 text-white p-2 rounded text-sm">
                                    Obriši
                                </button>
                            </Show>
                            <Show when={item.done === false && item.owner_id === session().user.id}>
                                <button
                                    on:click={() => markDone(item.id)}
                                    class="bg-indigo-600 text-white p-2 rounded text-sm">
                                    Završi
                                </button>
                            </Show>
                            <Show when={item.done}>
                                <div class="text-right">Zadatak je završen.</div>
                            </Show>
                        </div>
                    )}
                </For>
            </Show>
            <Show when={!project()}>
                <div>Projekt ne postoji</div>
            </Show>
        </>
    );
}

//class="bg-indigo-600 text-white text-xl px-6 py-2 rounded shadow-lg hover:bg-indigo-700"