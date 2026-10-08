const express = require("express"); 
const router = express.Router(); 
const Patient = require("../models/patient"); 
// Traduit les erreurs Mongoose en codes HTTP 
function handleError(res, err) { 
if (err.name === "ValidationError") { 
const erreurs = Object.values(err.errors).map(e => e.message); 
return res.status(400).json({ message: "Données invalides", erreurs }); 
}
if (err.name === "CastError") { 
return res.status(400).json({ message: "Identifiant invalide" }); 
}
console.error(err); 
return res.status(500).json({ message: "Erreur serveur" }); 
}

// CREATE -> 201 
router.post("/", async (req, res) => { 
try { 
const patient = new Patient(req.body); 
await patient.save(); 
res.status(201).json(patient); 
} catch (err) { handleError(res, err); } 
});

// READ ALL -> 200 
router.get("/", async (req, res) => { 
try { 
const patients = await Patient.find().sort({ createdAt: -1 }); 
res.status(200).json(patients); 
} catch (err) { handleError(res, err); } 
});

// READ ONE -> 200 
router.get("/:id", async (req, res) => { 
try { 
const patient = await Patient.findById(req.params.id); 
if (!patient) { 
return res.status(404).json({ message: "Patient introuvable" }); 
}
res.status(200).json(patient); 
} catch (err) { handleError(res, err); } 
});

// UPDATE -> 200 
router.put("/:id", async (req, res) => { 
try { 
const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { 
new: true, 
runValidators: true 
}); 
if (!patient) { 
return res.status(404).json({ message: "Patient introuvable" }); 
}
res.status(200).json(patient); 
} catch (err) { handleError(res, err); } 
});

// DELETE -> 200 
router.delete("/:id", async (req, res) => { 
try { 
const patient = await Patient.findByIdAndDelete(req.params.id); 
if (!patient) { 
return res.status(404).json({ message: "Patient introuvable" }); 
}
res.status(200).json({ message: "Patient supprimé", patient }); 
} catch (err) { handleError(res, err); } 
});

module.exports = router; 
