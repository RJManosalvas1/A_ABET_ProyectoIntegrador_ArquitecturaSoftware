export type EnrollRequest = {
  fullName: string;
  documentId: string;
  role: string;
  descriptor: number[];      // 128 floats
  photoBase64?: string;      // opcional (si decides enviar imagen)
};

export type VerifyRequest = {
  userId: string;
  descriptor: number[];
};

export type UserDto = {
  id: string;
  fullName: string;
  documentId: string;
  role: string;
};
