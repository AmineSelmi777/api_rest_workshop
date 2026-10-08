const express = require("express");
const router = express.Router();
const Consultation = require("../models/consultation");
const Patient = require("../models/patient");

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
    const consultation = new Consultation(req.body || {});
    await consultation.validate();

    const patient = await Patient.findById(consultation.patient);
    if (!patient) {
      return res.status(404).json({ message: "Patient introuvable" });
    }

    await consultation.save();
    res.status(201).json(consultation);
  } catch (err) { handleError(res, err); }
});

// READ ALL -> 200
router.get("/", async (req, res) => {
  try {
    const filtre = {};
    if (req.query.patient) filtre.patient = req.query.patient;
    if (req.query.statut) filtre.statut = req.query.statut;

    const consultations = await Consultation.find(filtre)
      .populate("patient", "nom prenom")
      .sort({ date: -1 });
    res.status(200).json(consultations);
  } catch (err) { handleError(res, err); }
});

// READ ONE -> 200
router.get("/:id", async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate("patient", "nom prenom");
    if (!consultation) {
      return res.status(404).json({ message: "Consultation introuvable" });
    }
    res.status(200).json(consultation);
  } catch (err) { handleError(res, err); }
});

// UPDATE -> 200
router.put("/:id", async (req, res) => {
  try {
    const donnees = req.body || {};
    if (donnees.patient) {
      const patient = await Patient.findById(donnees.patient);
      if (!patient) {
        return res.status(404).json({ message: "Patient introuvable" });
      }
    }

    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      donnees,
      { new: true, runValidators: true }
    ).populate("patient", "nom prenom");
    if (!consultation) {
      return res.status(404).json({ message: "Consultation introuvable" });
    }
    res.status(200).json(consultation);
  } catch (err) { handleError(res, err); }
});

// DELETE -> 200
router.delete("/:id", async (req, res) => {
  try {
    const consultation = await Consultation.findByIdAndDelete(req.params.id)
      .populate("patient", "nom prenom");
    if (!consultation) {
      return res.status(404).json({ message: "Consultation introuvable" });
    }
    res.status(200).json({ message: "Consultation supprimée", consultation });
  } catch (err) { handleError(res, err); }
});

module.exports = router;
