/*  
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
  Paper,
} from "@mui/material";

 
const schema = yup.object().shape({
  username: yup.string().required("נא להזין שם"),
  email: yup.string().email("אימייל לא תקין").required("נא להזין אימייל"),
  password: yup.string().min(6, "הסיסמה צריכה לפחות 6 תווים").required("נא להזין סיסמה"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "הסיסמאות לא תואמות") // ודא ששדות הסיסמה זהים
    .required("נא לאשר את הסיסמה"),
  language: yup.mixed<'he' | 'en'>().oneOf(['he', 'en']).required("יש לבחור שפה"),
});

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

       const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3001/api";
      const registerEndpoint = `${apiUrl}/users/register`; // בניית הנתיב המלא לנקודת הקצה

      const response = await fetch(registerEndpoint, {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload),  
      });

       if (!response.ok) {
        const errorData = await response.json();  
        throw new Error(errorData.message || "שגיאה ברישום משתמש");
      }

       const result = await response.json();  

      console.log("המשתמש נרשם בהצלחה:", result.message);
      console.log("טוקן שהתקבל:", result.token);
      console.log("פרטי המשתמש שהתקבלו:", result.user);

       localStorage.setItem('authToken', result.token);
      localStorage.setItem('currentUser', JSON.stringify(result.user));

        alert("ההרשמה בוצעה בהצלחה! הנך מחובר/ת."); // זמני

    } catch (error) {
      console.error("שגיאה ברישום:", error);
       alert(`שגיאה ברישום: ${error instanceof Error ? error.message : String(error)}`); // זמני
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
            select  
            fullWidth
            margin="normal"
            {...register("language")}
            error={!!errors.language}
            helperText={errors.language?.message}
            defaultValue="he"  
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
 */


 
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
  language: yup.mixed<'he' | 'en'>().oneOf(['he', 'en']).required("יש לבחור שפה"),
});

// טיפוס נתונים עבור הנתונים שמתקבלים מהטופס
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

      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3001/api";
      const registerEndpoint = `${apiUrl}/users/register`;

      const response = await fetch(registerEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: 'include', 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "שגיאה ברישום משתמש");
      }

      const result = await response.json();  
 
      console.log("המשתמש נרשם בהצלחה:", result.message);
      console.log("פרטי המשתמש שהתקבלו:", result.user);

       

      alert("ההרשמה בוצעה בהצלחה! הנך מחובר/ת.");  
 
    } catch (error) {
      console.error("שגיאה ברישום:", error);
      alert(`שגיאה ברישום: ${error instanceof Error ? error.message : String(error)}`); // זמני
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
            select
            fullWidth
            margin="normal"
            {...register("language")}
            error={!!errors.language}
            helperText={errors.language?.message}
            defaultValue="he"
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
