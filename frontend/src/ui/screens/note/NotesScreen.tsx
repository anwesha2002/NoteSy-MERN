import * as NotesApi from "../../../data/remote/NoteDataSource";
import React, {useEffect, useState} from "react"
import Note from "../../../data/models/Note";
import NoteItem from "../../components/noteItem/NoteItem";
import Grid from '@mui/material/Unstable_Grid2';
import {Box, Fab} from "@mui/material";
import AddEditNoteModal from "../../components/AddEditNoteModal/AddEditNoteModal";
import {Add, DeleteOutlineRounded} from "@mui/icons-material";
import styles from "./NoteScreen.module.css"

const NotesScreen = () => {
    const [notes, setNotes] = useState<Note[]>([])
    const [isModalOpen, setModalOpen] = useState(false)
    const [noteToEdit, setNoteToEdit] = useState<Note | undefined>(undefined)
    const [canDelete, setCanDelete] = useState(false)
    const [isHoveringOnDelete, setIsHoveringOnDelete] = useState(false)

    useEffect(() => {
        async function loadNotes() {
            try {
                const notes = await NotesApi.getAllNotes()
                setNotes(notes)
            } catch (error) {
                console.log(error)
            }
        }

        loadNotes()
    }, []);

    async function deleteNote(noteId:string){
        try{
            await NotesApi.deleteNote(noteId)
            setNotes(notes.filter(note => note._id !== noteId))
        } catch(error){
            alert(error)
            console.log(error)
        }
    }


    function onDrag(e: React.DragEvent, noteId: string) {
        e.dataTransfer?.setData("noteId", noteId)
        setCanDelete(true)
    }

    function onDrop(e: React.DragEvent) {
        const noteId = e.dataTransfer?.getData("noteId")
        if (!noteId) return
        deleteNote(noteId)
    }

    const onDragOverDelete = (e:React.DragEvent) => {
        e.preventDefault()
        setIsHoveringOnDelete(true)
    }

    const onDragOffDelete = () => setIsHoveringOnDelete(false)

    const onDragEnd = () => setCanDelete(false)



    const notesGrid =
        <Grid container spacing={{xs: 3, md: 2}} columns={{xs: 2, sm: 4, md: 8}}>
            {notes.map(note => (
                <Grid key={note._id}>
                    <NoteItem
                        note={note}
                        onClick={setNoteToEdit}
                        onDragStart={(e, note) => onDrag(e, note._id)}
                        onDragEnd = {onDragEnd}
                    />
                </Grid>
            ))}
        </Grid>

    return (
        <>
            <Box className={styles.noteScreen}>
                <Box p={2}>{notesGrid}</Box>
                {isModalOpen && <AddEditNoteModal
                    onNoteSave={note => {
                        setModalOpen(false)
                        setNotes([...notes, note]);
                    }
                    }
                    onDismiss={() => {
                        setModalOpen(false)
                    }}
                />
                }
                {noteToEdit && <AddEditNoteModal
                    note={noteToEdit}
                    onNoteSave={newNote => {
                        setNotes(notes.map(note => (note._id === newNote._id) ? newNote : note))
                        setNoteToEdit(undefined)
                    }
                    }
                    onDismiss={() => {
                        setNoteToEdit(undefined)
                    }}
                />
                }
                <Fab
                    className={styles.addNoteFab}
                    aria-label="add"
                    color="primary"
                    onClick={() => setModalOpen(true)}
                    sx={{
                        position: "absolute",
                        bottom: 32,
                        right: 32,
                    }}
                >
                    <Add/>
                </Fab>

                {canDelete && <Fab
                    aria-label="delete"
                    color="error"
                    onDrop={onDrop}
                    onDragOver={onDragOverDelete}
                    onDragLeave={onDragOffDelete}
                    size={
                        isHoveringOnDelete ? "large" : "medium"
                    }
                    sx = {{
                        zIndex: 5,
                        position: "absolute",
                        bottom: 32,
                        left: "50%",
                        right: "50%"
                    }}
                >
                    <DeleteOutlineRounded/>
                </Fab>
                }

            </Box>
        </>
    );
};

export default NotesScreen;