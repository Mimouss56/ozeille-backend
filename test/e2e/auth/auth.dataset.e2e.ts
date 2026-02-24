export const AuthDataset = {
  // Utilisateur standard pour tester le Login et le 2FA
  confirmedUser: {
    email: "confirmed@example.com",
    password: "Password123!",
    firstName: "Confirmed",
    lastName: "User",
  },
  // Utilisateur pour tester le blocage du Login et la confirmation d'email
  unconfirmedUser: {
    email: "unconfirmed@example.com",
    password: "Password123!",
    firstName: "Unconfirmed",
    lastName: "User",
  },
  // Base de données pour les tests de création de compte
  registerUser: {
    email: "register.test@example.com",
    password: "Password123!",
    confirmedPassword: "Password123!",
    firstName: "Register",
    lastName: "Test",
  },
  confirmToken: "valid-confirmation-token-123",
};
