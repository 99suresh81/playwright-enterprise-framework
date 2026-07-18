import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  private readonly usernameInput = this.page.getByTestId('username');
  private readonly passwordInput = this.page.getByTestId('password');
  private readonly submitButton = this.page.getByRole('button', { name: /log in/i });
  private readonly errorMessage = this.page.getByTestId('login-error');

  constructor(page: Page) {
    super(page);
  }

  async login(username: string, password: string): Promise<void> {
    await this.goto('/login');
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.clickAndWait(this.submitButton);
  }

  async getErrorText(): Promise<string | null> {
    return this.errorMessage.textContent();
  }
}
