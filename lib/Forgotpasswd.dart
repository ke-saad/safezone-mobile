import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';

class Forgotp extends StatefulWidget {
  const Forgotp({Key? key}) : super(key: key);

  @override
  State<Forgotp> createState() => _ForgotpState();
}

class _ForgotpState extends State<Forgotp> {
  final emailResetController = TextEditingController();
  late Size mediaSize;

  @override
  void dispose() {
    emailResetController.dispose();
    super.dispose();
  }

  Future<void> passwdReset() async {
    if (emailResetController.text.trim().isEmpty) {
      // Implement error handling for empty email field
      return;
    }
    try {
      await FirebaseAuth.instance
          .sendPasswordResetEmail(email: emailResetController.text.trim());
      // Implement success dialog
    } on FirebaseAuthException catch (e) {
      // Implement error handling
    }
  }

  @override
  Widget build(BuildContext context) {
    mediaSize = MediaQuery.of(context).size;
    return Container(
      decoration: BoxDecoration(
        image: DecorationImage(
          image: AssetImage("assets/images/way.png"),
          fit: BoxFit.cover,
          colorFilter: ColorFilter.mode(
            Colors.blue.withOpacity(0.2),
            BlendMode.dstATop,
          ),
        ),
      ),
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: Stack(
          children: [
            Positioned(
              top: mediaSize.height * 0.2, // Adjust the positioning as required
              child: _buildTop(),
            ),
            Positioned(
              bottom: 0,
              child: _buildBottom(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTop() {
    return SizedBox(
      width: mediaSize.width,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.email,
            size: 100,
            color: Colors.white,
          ),
          Text(
            "Reset Password",
            style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 40,
                letterSpacing: 2),
          )
        ],
      ),
    );
  }

  Widget _buildBottom() {
    return SizedBox(
      width: mediaSize.width,
      child: Card(
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(30),
            topRight: Radius.circular(30),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildGreyText("Enter your email address to reset your password"),
              SizedBox(height: 20),
              _buildInputField(emailResetController),
              SizedBox(height: 20),
              ElevatedButton(
                onPressed: passwdReset,
                style: ElevatedButton.styleFrom(
                  shape: const StadiumBorder(),
                  elevation: 2,
                  shadowColor: Colors.blue,
                  minimumSize: const Size.fromHeight(60),
                ),
                child: Text("SEND RESET LINK"),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGreyText(String text) {
    return Text(
      text,
      style: const TextStyle(color: Colors.grey, fontSize: 16),
      textAlign: TextAlign.center,
    );
  }

  Widget _buildInputField(TextEditingController controller) {
    return TextField(
      controller: controller,
      decoration: InputDecoration(
        suffixIcon: Icon(Icons.mail_outline),
        labelText: "Email",
        border: OutlineInputBorder(),
      ),
      keyboardType: TextInputType.emailAddress,
    );
  }
}
