import { Request, Response } from "express";
import Note, { INote } from "../models/Note";
import colors from "colors";
import { Types } from "mongoose";

type NoteParams = {
  noteId: Types.ObjectId;
};

export class NoteController {
  static async createNote(req: Request<{}, {}, INote>, res: Response) {
    try {
      const { content } = req.body;
      const note = new Note();

      note.content = content;
      note.createdBy = req.user.id;
      note.task = req.task.id;

      req.task.notes.push(note.id);
      await Promise.allSettled([req.task.save(), note.save()]);

      res.send("Nota creada correctamente.");
    } catch (error) {
      console.log(colors.red.bold(error));
      return res.status(500).json({ error: "Error interno." });
    }
  }

  static async getTaskNotes(req: Request, res: Response) {
    try {
      const notes = await Note.find({
        task: req.task.id,
      });
      res.json(notes);
    } catch (error) {
      console.log(colors.red.bold(error));
      return res.status(500).json({ error: "Error interno." });
    }
  }

  static async deleteTaskNotes(req: Request<NoteParams>, res: Response) {
    try {
      const { noteId } = req.params;
      const note = await Note.findById(noteId);

      if (!note) {
        const error = new Error("Nota no encontrada");
        return res.status(404).send(error.message);
      }

      if (note.createdBy.toString() !== req.user.id) {
        const error = new Error("Acción no válida.");
        return res.status(401).send(error.message);
      }

      req.task.notes = req.task.notes.filter(
        (task) => task._id.toString() !== noteId.toString()
      );

      await Promise.allSettled([note.deleteOne(), req.task.save()]);
      res.send("Nota eliminada.");
    } catch (error) {
      console.log(colors.red.bold(error));
      return res.status(500).json({ error: "Error interno." });
    }
  }
}
