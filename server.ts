import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { PrismaClient } from "@prisma/client";
import cors from "cors";

// Initialize Prisma
const prisma = new PrismaClient();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());

  // === API ROUTES ===

  // App Stats
  app.get("/api/stats", async (req, res) => {
    try {
      const websites = await prisma.website.count({ where: { status: 'active' } });
      const updates = await prisma.changeLog.count();
      const openTasks = await prisma.task.count({ where: { status: { not: 'Completed' } } });
      const openIssues = await prisma.issue.count({ where: { status: { not: 'Closed' } } });
      res.json({ websites, updates, openTasks, openIssues });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Chart Data
  app.get("/api/stats/chart", async (req, res) => {
    try {
      const changes = await prisma.changeLog.findMany({
        select: { date: true },
      });
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonth = new Date().getMonth();
      const last7Months = [];
      for (let i = 6; i >= 0; i--) {
        let m = currentMonth - i;
        if (m < 0) m += 12;
        last7Months.push({ name: months[m], updates: 0, monthIndex: m });
      }
      changes.forEach(c => {
        // Simplified check, matches month regardless of year (good enough for short spans)
        const target = last7Months.find(l => l.monthIndex === new Date(c.date).getMonth());
        if (target) target.updates += 1;
      });
      res.json(last7Months.map(l => ({ name: l.name, updates: l.updates })));
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Export Data
  app.get("/api/export", async (req, res) => {
    try {
      const websites = await prisma.website.findMany();
      const changes = await prisma.changeLog.findMany();
      const tasks = await prisma.task.findMany();
      const issues = await prisma.issue.findMany();
      const maintenanceLogs = await prisma.maintenanceLog.findMany();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=wp-tracker-export.json');
      res.json({ websites, changes, tasks, issues, maintenanceLogs });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Websites CRUD
  app.get("/api/websites", async (req, res) => {
    try {
      const websites = await prisma.website.findMany({ 
        where: { status: 'active' },
        orderBy: { createdAt: 'desc' }
      });
      res.json(websites);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  app.post("/api/websites", async (req, res) => {
    try {
      const website = await prisma.website.create({ data: req.body });
      res.json(website);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  app.get("/api/websites/:id", async (req, res) => {
    try {
      const website = await prisma.website.findUnique({ where: { id: req.params.id } });
      res.json(website);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Change Log CRUD
  app.get("/api/changes", async (req, res) => {
    try {
      const { websiteId } = req.query;
      const changes = await prisma.changeLog.findMany({
        where: websiteId ? { websiteId: String(websiteId) } : {},
        include: { website: true },
        orderBy: { date: 'desc' },
      });
      res.json(changes);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  app.post("/api/changes", async (req, res) => {
    try {
      const data = { ...req.body, date: new Date(req.body.date) };
      const change = await prisma.changeLog.create({ data });
      res.json(change);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  app.put("/api/changes/:id", async (req, res) => {
    try {
      const data = { ...req.body };
      if (data.date) data.date = new Date(data.date);
      const change = await prisma.changeLog.update({
        where: { id: req.params.id },
        data
      });
      res.json(change);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Tasks CRUD
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await prisma.task.findMany({
        include: { website: true },
        orderBy: { createdAt: 'desc' },
      });
      res.json(tasks);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const data = { ...req.body };
      if (data.dueDate) data.dueDate = new Date(data.dueDate);
      const task = await prisma.task.create({ data });
      res.json(task);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const data = { ...req.body };
      if (data.dueDate) data.dueDate = new Date(data.dueDate);
      const task = await prisma.task.update({
        where: { id: req.params.id },
        data
      });
      res.json(task);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

   // Issues CRUD
  app.get("/api/issues", async (req, res) => {
    try {
      const issues = await prisma.issue.findMany({
        include: { website: true },
        orderBy: { dateReported: 'desc' },
      });
      res.json(issues);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  app.post("/api/issues", async (req, res) => {
    try {
      const data = { ...req.body };
      const issue = await prisma.issue.create({ data });
      res.json(issue);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  app.put("/api/issues/:id", async (req, res) => {
    try {
      const data = { ...req.body };
      if (data.dateReported) data.dateReported = new Date(data.dateReported);
      if (data.dateResolved) data.dateResolved = new Date(data.dateResolved);
      const issue = await prisma.issue.update({
        where: { id: req.params.id },
        data
      });
      res.json(issue);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // Maintenance Logs CRUD
  app.get("/api/maintenance", async (req, res) => {
    try {
      const logs = await prisma.maintenanceLog.findMany({
        include: { website: true },
        orderBy: { date: 'desc' },
      });
      res.json(logs);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  app.post("/api/maintenance", async (req, res) => {
    try {
      const data = { ...req.body, date: new Date(req.body.date) };
      const log = await prisma.maintenanceLog.create({ data });
      res.json(log);
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  // === VITE MIDDLEWARE ===
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
