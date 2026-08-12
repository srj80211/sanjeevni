import { AshaWorkers } from "../models/asha.model.js";

export const getAshaWorkers = async () => AshaWorker.find({});

export const createAshaWorker = async (data) => AshaWorker.create(data);