import { Router } from "express";
import { body, param } from "express-validator";
import { ProjectController } from "../controllers/ProjectController";
import { TaskController } from "../controllers/TaskController";
import { handleInputErrors } from "../middleware/validation";
import { validateCurrentProject } from "../middleware/project";
import { validateCurrentTask } from "../middleware/task";

const router = Router();

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

// Routes for tasks
router.param("projectId", validateCurrentProject);

router.post(
  "/:projectId/tasks",
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
  param("taskId").isMongoId().withMessage("Id no válido."),
  handleInputErrors,
  TaskController.deleteTask
);

export default router;
