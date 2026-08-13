import { Consultations } from "../models/consultation.model.js";

export const getConsultations = async () => Consultations.find({});

export const createConsultation = async (data) => Consultations.create(data);
