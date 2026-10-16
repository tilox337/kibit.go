import { useId, useState, type ComponentProps } from "react";
import { useForm, type RegisterOptions } from "react-hook-form";
import { loginUser, normalizeEmail, registerUser } from "../session";
import styles from "./AuthPage.module.css";

type View = "choose" | "register" | "login";

type LoginValues = {
  email: string;
  password: string;
};

type RegisterValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

type AuthPageProps = {
  onSuccess: (email: string) => void;
};

type AuthFormProps = AuthPageProps & {
  onBack: () => void;
};

const emailRules = {
  required: "Введите email",
  setValueAs: (value: string) => normalizeEmail(value),
  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Некорректный email" },
} satisfies RegisterOptions;

export default function AuthPage({ onSuccess }: AuthPageProps) {
  const [view, setView] = useState<View>("choose");

  return (
    <div className={styles.page}>
      {view === "choose" && (
        <div className={`${styles.panel} ${styles.choice}`}>
          <button className={styles.button} type="button" onClick={() => setView("register")}>
            Регистрация
          </button>
          <button className={styles.button} type="button" onClick={() => setView("login")}>
            Вход
          </button>
        </div>
      )}
      {view === "register" && (
        <RegisterForm onBack={() => setView("choose")} onSuccess={onSuccess} />
      )}
      {view === "login" && <LoginForm onBack={() => setView("choose")} onSuccess={onSuccess} />}
    </div>
  );
}

function LoginForm({ onBack, onSuccess }: AuthFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>();

  function onSubmit(values: LoginValues) {
    const result = loginUser(values.email, values.password);
    if (result === "invalid") {
      setError("root", { message: "Неверный email или пароль" });
      return;
    }
    onSuccess(values.email);
  }

  return (
    <form className={styles.panel} noValidate onSubmit={handleSubmit(onSubmit)}>
      <Field
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email", emailRules)}
      />
      <Field
        label="Пароль"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password", { required: "Введите пароль" })}
      />
      {errors.root && (
        <p className={styles.error} role="alert">
          {errors.root.message}
        </p>
      )}

      <FormActions submitLabel="Войти" onBack={onBack} />
    </form>
  );
}

function RegisterForm({ onBack, onSuccess }: AuthFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterValues>();

  function onSubmit(values: RegisterValues) {
    const result = registerUser(values.email, values.password);
    if (result === "exists") {
      setError("email", { message: "Такой email уже зарегистрирован" });
      return;
    }
    onSuccess(values.email);
  }

  return (
    <form className={styles.panel} noValidate onSubmit={handleSubmit(onSubmit)}>
      <Field
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email", emailRules)}
      />
      <Field
        label="Пароль"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password", {
          required: "Введите пароль",
          minLength: { value: 6, message: "Минимум 6 символов" },
          deps: ["confirmPassword"],
        })}
      />
      <Field
        label="Повторите пароль"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword", {
          required: "Повторите пароль",
          validate: (value, formValues) => value === formValues.password || "Пароли не совпадают",
        })}
      />

      <FormActions submitLabel="Зарегистрироваться" onBack={onBack} />
    </form>
  );
}

type FieldProps = ComponentProps<"input"> & {
  label: string;
  error?: string;
};

function Field({ label, error, ...inputProps }: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        {...inputProps}
        id={id}
        className={styles.input}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}

function FormActions({ submitLabel, onBack }: { submitLabel: string; onBack: () => void }) {
  return (
    <div className={styles.actions}>
      <button className={styles.button} type="submit">
        {submitLabel}
      </button>
      <button className={`${styles.button} ${styles.buttonSecondary}`} type="button" onClick={onBack}>
        Назад
      </button>
    </div>
  );
}
