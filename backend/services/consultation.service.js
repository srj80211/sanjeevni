import { Consultation } from "../models/consultation.model.js";

export const getConsultations = async () => Consultation.find({});

export const createConsultation = async (data) => Consultation.create(data);