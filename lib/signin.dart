import 'package:flutter/material.dart';
import 'package:safezone/Login.dart';

class Signin extends StatefulWidget {
  const Signin({Key? key}) : super(key: key);

  @override
  State<Signin> createState() => _SignupState();
}

class _SignupState extends State<Signin> {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController confirmPasswordController =
      TextEditingController();
  final GlobalKey<FormState> formKey = GlobalKey<FormState>();
  bool isVisible = false;
  late Size mediaSize;

  @override
  Widget build(BuildContext context) {
    mediaSize = MediaQuery.of(context).size;

    return Scaffold(
      body: SingleChildScrollView(
        child: Form(
          key: formKey,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SizedBox(
                width: mediaSize.width,
                child: _buildTop(
                  "Register New Account",
                  Icons.person_add_alt_1,
                ),
              ),
              SizedBox(height: 15),
              _buildInputForm(),
              _buildSignUpButton(),
              _buildLoginPrompt(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTop(String title, IconData icon) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 100, color: Colors.white),
        Text(
          title,
          style: TextStyle(
              color: Colors.black,
              fontWeight: FontWeight.bold,
              fontSize: 32,
              letterSpacing: 2),
        ),
      ],
    );
  }

  Widget _buildInputForm() {
    // Styling can be consistent with your theme
    return Column(
      children: [
        _buildTextField(emailController, "Email", Icons.email, false),
        _buildTextField(passwordController, "Password", Icons.lock, true),
        _buildTextField(
            confirmPasswordController, "Confirm Password", Icons.lock, true),
        SizedBox(height: 20),
      ],
    );
  }

  Widget _buildTextField(TextEditingController controller, String hintText,
      IconData icon, bool isPassword) {
    return Container(
      margin: EdgeInsets.all(8),
      padding: EdgeInsets.symmetric(horizontal: 10, vertical: 10),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        color: Colors.blue.withOpacity(.3), // Adjust as needed
      ),
      child: TextFormField(
        controller: controller,
        decoration: InputDecoration(
          icon: Icon(icon),
          border: InputBorder.none,
          hintText: hintText,
          suffixIcon: isPassword
              ? IconButton(
                  onPressed: () {
                    setState(() {
                      isVisible = !isVisible;
                    });
                  },
                  icon:
                      Icon(isVisible ? Icons.visibility : Icons.visibility_off))
              : null,
        ),
        obscureText: isPassword && isVisible,
        validator: (value) {
          if (value == null || value.isEmpty) {
            return '$hintText is required';
          }
          if (isPassword &&
              controller == confirmPasswordController &&
              value != passwordController.text) {
            return "Passwords don't match";
          }
          return null;
        },
      ),
    );
  }

  Widget _buildSignUpButton() {
    // This assumes GlobalColor.butnColor is defined in your colors file
    return Container(
      height: 55,
      width: mediaSize.width * .9,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        color: Colors.blue, // Use the same style as your login button
      ),
      child: TextButton(
        onPressed: () {
          if (formKey.currentState!.validate()) {
            // Sign-up method
          }
        },
        child: Text(
          "SIGN UP",
          style: TextStyle(color: Colors.white),
        ),
      ),
    );
  }

  Widget _buildLoginPrompt() {
    // Consistent with the login page
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text("Already have an account? "),
        TextButton(
          onPressed: () {
            Navigator.push(context,
                MaterialPageRoute(builder: (context) => const Login()));
          },
          child: Text("Log in",
              style:
                  TextStyle(color: Colors.blue)), // Assuming your color scheme
        ),
      ],
    );
  }
}
