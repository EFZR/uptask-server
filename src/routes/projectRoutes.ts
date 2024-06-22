import { Router } from "express";
import { body, param } from "express-validator";
import { ProjectController } from "../controllers/ProjectController";
import { TaskController } from "../controllers/TaskController";
import { handleInputErrors } from "../middleware/validation";
import { validateCurrentProject } from "../middleware/project";
import { hasAuthorization, validateCurrentTask } from "../middleware/task";
import { authenticate } from "../middleware/auth";
import { TeamController } from "../controllers/TeamController";
import { NoteController } from "../controllers/NoteController";

const router = Router();

router.use(authenticate);

// Routes for Projects.
router.post(
  "/",
  body("projectName")
    .notEmpty()
    .withMessage("El nombre del proyecto es obligatorio."),
  body("clientName")
    .notEmpty()
    .withMessage("El nombre del cliente es obligatorio."),
  body("description")
    .notEmpty()
    .withMessage("La descripción del proyecto es obligatoria."),

  handleInputErrors,
  ProjectController.createProject
);

router.get("/", ProjectController.getAllProjects);

router.get(
  "/:id",
  param("id").isMongoId().withMessage("Id no válido."),
  handleInputErrors,
  ProjectController.getProjectById
);

router.put(
  "/:id",
  param("id").isMongoId().withMessage("Id no válido."),
  body("projectName")
    .notEmpty()
    .withMessage("El nombre del proyecto es obligatorio."),
  body("clientName")
    .notEmpty()
    .withMessage("El nombre del cliente es obligatorio."),
  body("description")
    .notEmpty()
    .withMessage("La descripción del proyecto es obligatoria."),

  handleInputErrors,
  ProjectController.updateProject
);

router.delete(
  "/:id",
  param("id").isMongoId().withMessage("Id no válido."),
  handleInputErrors,
  ProjectController.deleteProject
);

// Routes for Tasks
router.param("projectId", validateCurrentProject);

router.post(
  "/:projectId/tasks",
  hasAuthorization,
  body("taskName")
    .notEmpty()
    .withMessage("El nombre de la tarea es obligatorio."),
  body("description")
    .notEmpty()
    .withMessage("La descripción de la tarea es obligatoria."),
  handleInputErrors,
  TaskController.createTask
);

router.get(
  "/:projectId/tasks",
  handleInputErrors,
  TaskController.getProjectTasks
);

router.param("taskId", validateCurrentTask);

router.get(
  "/:projectId/tasks/:taskId",
  param("taskId").isMongoId().withMessage("Id no válido."),
  handleInputErrors,
  TaskController.getProjectTaskById
);

router.put(
  "/:projectId/tasks/:taskId",
  hasAuthorization,
  param("taskId").isMongoId().withMessage("Id no válido."),
  body("taskName")
    .notEmpty()
    .withMessage("El nombre de la tarea es obligatorio."),
  body("description")
    .notEmpty()
    .withMessage("La descripción de la tarea es obligatoria."),
  handleInputErrors,
  TaskController.updateTask
);

router.patch(
  "/:projectId/tasks/:taskId/status",
  param("taskId").isMongoId().withMessage("Id no válido."),
  body("status")
    .notEmpty()
    .withMessage("El estado de la tarea es obligatorio."),
  handleInputErrors,
  TaskController.updateTaskStatus
);

router.delete(
  "/:projectId/tasks/:taskId",
  hasAuthorization,
  param("taskId").isMongoId().withMessage("Id no válido."),
  handleInputErrors,
  TaskController.deleteTask
);

// Routes for Teams.
router.post(
  "/:projectId/team/find",
  body("email").isEmail().toLowerCase().withMessage("E-Mail no es válido."),
  handleInputErrors,
  TeamController.findMemberByEmail
);

router.post(
  "/:projectId/team",
  body("id").isMongoId().withMessage("Id no válido."),
  handleInputErrors,
  TeamController.addMemberId
);

router.delete(
  "/:projectId/team/:userId",
  param("userId").isMongoId().withMessage("Id no válido."),
  handleInputErrors,
  TeamController.removeMemberId
);

router.get(
  "/:projectId/team",
  handleInputErrors,
  TeamController.getProjectTeam
);

// Routes for Notes.
router.post(
  "/:projectId/tasks/:taskId/notes",
  body("content")
    .notEmpty()
    .withMessage("El contenido de la nota es obligatorio."),
  handleInputErrors,
  NoteController.createNote
);

router.get("/:projectId/tasks/:taskId/notes", NoteController.getTaskNotes);

router.delete(
  "/:projectId/tasks/:taskId/notes/:noteId",
  param("noteId").isMongoId().withMessage("Id No valido."),
  handleInputErrors,
  NoteController.deleteTaskNotes
);

export default router;
