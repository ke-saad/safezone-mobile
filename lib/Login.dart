import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:safezone/Forgotpasswd.dart';
import 'package:safezone/map.dart';
import 'package:safezone/map2.dart';
import 'package:safezone/signin.dart';
import 'package:http/http.dart' as http;

class Login extends StatefulWidget {
  const Login({super.key});

  @override
  State<Login> createState() => _LoginState();
}

class _LoginState extends State<Login> {
  late Size mediasize;
  TextEditingController emailController = TextEditingController();
  TextEditingController passwordController = TextEditingController();
  bool rememberUser = false;
  bool isNotValid = false;
  bool hidepassword = true;
  //GlobalKey<FormState> globalFormkey = GlobalKey<FormState>();
  //String? username;
  //String? paswd;
  void loginUser() async {
    if (emailController.text.isNotEmpty && passwordController.text.isNotEmpty) {
      var logBody = {
        "email": emailController.text,
        "password": emailController.text
      };
      var response = await http.post(Uri.parse('uri'));
      // header:{"Content-type":"application/json"}
      body:
      jsonEncode(logBody);
    } else {
      setState(() {
        isNotValid = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    mediasize = MediaQuery.of(context).size; // MediaQuery call is fine here.
    return Container(
      decoration: BoxDecoration(
        image: DecorationImage(
          image:
              AssetImage("assets/images/way.png"), // Corrected AssetImage path.
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
              top: 80,
              child: _buildTop(),
            ),
            Positioned(
              bottom: 0,
              child: _buildBottom(),
            ),

            // Call your method here.
          ],
        ),
      ),
    );
  }

  // This is now an instance method of _LoginState.
  Widget _buildTop() {
    return SizedBox(
      width: mediasize.width, // Now mediasize is accessible here.
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.location_on_sharp,
            size: 100,
            color: Colors.white,
          ),
          Text(
            "SafeZone",
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
      width: mediasize.width,
      child: Card(
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(30),
            topRight: Radius.circular(30),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: _buildForm(),
        ),
      ),
    );
  }

  Widget _buildForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "Welcome",
          style: TextStyle(
            color: Colors.blue,
            fontSize: 32,
            fontWeight: FontWeight.w500,
          ),
        ),
        _buildGreyText("Please login with your information"),
        const SizedBox(height: 60),
        _buildGreyText("Email address"),
        _buildInputField(emailController),
        SizedBox(
          height: 40,
        ),
        _buildGreyText("Password"),
        _buildInputField(passwordController, isPassword: true),
        _buildRememberForgot(),
        _buildLoginButton(),
        SizedBox(
          height: 2,
        ),
        // _buildOtherLogin(),
        _Signin()
      ],
    );
  }

  Widget _buildGreyText(String text) {
    return Text(
      text,
      style: const TextStyle(color: Colors.grey),
    );
  }

  Widget _buildInputField(TextEditingController controller,
      {bool isPassword = false}) {
    return TextField(
      controller: controller,
      obscureText: isPassword,
      decoration: InputDecoration(
        suffixIcon: isPassword
            ? IconButton(
                icon: Icon(
                    hidepassword ? Icons.visibility_off : Icons.visibility),
                onPressed: () {
                  hidepassword = !hidepassword;
                },
              )
            : Icon(Icons.done),
      ),
    );
  }

  Widget _buildRememberForgot() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [],
        ),
        TextButton(
          onPressed: () {
            Navigator.push(context,
                MaterialPageRoute(builder: (context) => const Forgotp()));
          },
          child: _buildGreyText("I forgot my password"),
        ),
      ],
    );
  }

  Widget _buildLoginButton() {
    return ElevatedButton(
      onPressed: () {
        debugPrint("Email : ${emailController.text}");
        debugPrint("Password : ${passwordController.text}");
        Navigator.push(
            context, MaterialPageRoute(builder: (context) => HomeScreen()));
        loginUser();
      },
      style: ElevatedButton.styleFrom(
        shape: const StadiumBorder(),
        elevation: 2,
        shadowColor: Colors.blue,
        minimumSize: const Size.fromHeight(60),
      ),
      child: const Text("LOGIN"),
    );
  }

  /*Widget _buildOtherLogin() {
    return Center(
      child: Column(
        children: [
          _buildGreyText("Or Login with"),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              IconButton(
                icon: Image.asset("assets/images/gmail.png"),
                onPressed: () {},
              ),
              // IconButton(
              //  icon: Image.asset("assets/images/outlook.png"),
              //onPressed: () {},
              // ),
            ],
          ),
        ],
      ),
    );
  }*/
  Widget _Signin() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [],
        ),
        TextButton(
          onPressed: () {
            Navigator.push(
                context, MaterialPageRoute(builder: (context) => Signin()));
          },
          child: _buildGreyText("Create an account"),
        ),
      ],
    );
  }
}
