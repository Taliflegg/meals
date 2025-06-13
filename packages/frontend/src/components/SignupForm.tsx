import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  TextField,
  Button,
  MenuItem,  
  Box,
  Typography,
  Paper
} from "@mui/material";

// סכימת ולידציה עם Yup
const schema = yup.object().shape({
  username: yup.string().required("נא להזין שם"),
  email: yup.string().email("אימייל לא תקין").required("נא להזין אימייל"),
  password: yup.string().min(6, "הסיסמה צריכה לפחות 6 תווים").required("נא להזין סיסמה"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "הסיסמאות לא תואמות")
    .required("נא לאשר את הסיסמה"),
  language: yup.mixed<'he' | 'en'>().oneOf(['he', 'en']).required("יש לבחור שפה"), // זה השדה שדורש קלט
});

// טיפוסים
type FormData = yup.InferType<typeof schema>;

export default function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        username: data.username,
        email: data.email,
        password: data.password,
        language: data.language,  
      };

      // URL נכון ל-backend, פורט 3002 והנתיב /api/users/register
      const response = await fetch("http://localhost:3002/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "שגיאה ברישום משתמש");
      }

      const result = await response.json();
      console.log("המשתמש נרשם בהצלחה:", result);
      alert("המשתמש נרשם בהצלחה!"); // להצגה ויזואלית זמנית
    } catch (error) {
      console.error("שגיאה:", error);
      alert(`שגיאה ברישום: ${error instanceof Error ? error.message : String(error)}`); // להצגת שגיאות ויזואלית זמנית
    }
  };

  return (
    <Box dir="rtl" sx={{ maxWidth: 500, margin: "50px auto" }}>
      <Paper sx={{ p: 4 }} elevation={3}>
        <Typography variant="h5" align="center" gutterBottom>
          טופס הרשמה
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            label="שם"
            fullWidth
            margin="normal"
            {...register("username")}
            error={!!errors.username}
            helperText={errors.username?.message}
          />

          <TextField
            label="אימייל"
            type="email"
            fullWidth
            margin="normal"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            label="סיסמה"
            type="password"
            fullWidth
            margin="normal"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <TextField
            label="אישור סיסמה"
            type="password"
            fullWidth
            margin="normal"
            {...register("confirmPassword")}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />

           <TextField
            label="שפה"
            select // זה הופך את TextField לתיבת בחירה
            fullWidth
            margin="normal"
            {...register("language")}
            error={!!errors.language}
            helperText={errors.language?.message}
            defaultValue="he" // קבע ערך ברירת מחדל כדי למנוע ולידציה שגויה בהתחלה
          >
            <MenuItem value="he">עברית</MenuItem>
            <MenuItem value="en">English</MenuItem>
          </TextField>

          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
            הרשמה
          </Button>
        </form>
      </Paper>
    </Box>
  );
}