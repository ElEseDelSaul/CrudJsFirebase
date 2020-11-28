const db = firebase.firestore();

const taskForm = document.querySelector('#task-form')
const tasksContainer = document.querySelector('#tasks-container')
//const taskForm = document.getElementById('#task-form')

let editStatus = false;
let id = '';

/**
 * Save a New Task in Firebase
 * @param {string} title title of the task
 * @param {string} description description of the task
 */

const saveTask = (title, description) => {
    //Agregar tarea a Firestore
    db.collection('tasks').doc().set({
        title,
        description
    })
}
const getTasks = () => db.collection('tasks').get()
const onGetTasks = (callback) => db.collection('tasks').onSnapshot(callback)
const deleteTask = (id) => { db.collection('tasks').doc(id).delete() }
const getTask = (id) => db.collection('tasks').doc(id).get()
const updateTask = async (id, newTask) => {
    await db.collection('tasks').doc(id).update(newTask)
}
window.addEventListener('DOMContentLoaded', async (e) => {
    //console.log(e)
    //const querySnapshot = await getTasks()

    onGetTasks((querySnapshot) => {
        tasksContainer.innerHTML = '';
        querySnapshot.forEach(doc => {
            const task = doc.data();
            task.id = doc.id;   //El Id viene desde el DOCUMENTO , no desde la data
            //console.log(task)
            tasksContainer.innerHTML += `<div class="card card-body m-2">
            <h2>${task.title}</h2>
            <hr>
            <p>${task.description}</p>
            <div>
                <button class="btn btn-primary btn-edit" data-id=${task.id}>Edit</button>
                <button class="btn btn-danger btn-delete" data-id="${task.id}">Remove</button>
            </div>
        </div>`
            //Eliminar
            const btnsDelete = document.querySelectorAll('.btn-delete')
            btnsDelete.forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    //console.log(e.target.dataset.id) Conseguir id 
                    await deleteTask(e.target.dataset.id)
                })
            })
            //Editar
            const btnsEdit = document.querySelectorAll('.btn-edit')
            btnsEdit.forEach(btn => {
                btn.addEventListener('click', async (e) => { //Poblar inputs del Form
                    //console.log(e.target.dataset.id)
                    const doc = await getTask(e.target.dataset.id)
                    const task = doc.data()
                    editStatus = true
                    id = doc.id;
                    //console.log(doc.data())
                    taskForm['task-title'].value = task.title
                    taskForm['task-description'].value = task.description
                    taskForm['btn-task-form'].innerText = 'Update'
                })
            })

        })
    })

})



taskForm.addEventListener('submit', async e => {

    e.preventDefault()

    //Capturar data del Formulario
    const title = taskForm['task-title']
    const description = taskForm['task-description']

    if (!editStatus) {
        await saveTask(title.value, description.value)
    } else {
        await updateTask(id, {
            title: title.value,
            description: description.value
        })
        editStatus = false;
        taskForm['btn-task-form'].innerText = 'Save'
        id=''
    }

    taskForm.reset()
    title.focus()
    onGetTasks()


    console.log('Task Added')
})