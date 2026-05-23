package com.college.api.infrastructure.email;

import com.college.api.domain.email.EmailPort;
import software.amazon.awssdk.services.ses.SesClient;
import software.amazon.awssdk.services.ses.model.*;

public class SesEmailAdapter implements EmailPort {

    private final SesClient sesClient;
    private final String fromEmail;

    public SesEmailAdapter(SesClient sesClient, String fromEmail) {
        this.sesClient = sesClient;
        this.fromEmail = fromEmail;
    }

    @Override
    public void sendSetPasswordEmail(String toEmail, String username, String setPasswordUrl) {
        send(toEmail,
                "Defina sua senha - Portal Universitário",
                """
                Olá, %s!

                Sua conta foi criada no Portal Universitário.
                Por favor, acesse o link abaixo para criar sua senha:

                %s

                Este link é válido por 24 horas. Após esse prazo será necessário solicitar um novo link ao administrador.

                Atenciosamente,
                Portal Universitário
                """.formatted(username, setPasswordUrl));
    }

    @Override
    public void sendPasswordResetEmail(String toEmail, String username, String resetUrl) {
        send(toEmail,
                "Redefinição de senha - Portal Universitário",
                """
                Olá, %s!

                Recebemos uma solicitação para redefinir a senha da sua conta no Portal Universitário.
                Acesse o link abaixo para escolher uma nova senha:

                %s

                Este link é válido por 24 horas. Caso não tenha solicitado a redefinição, ignore este e-mail.

                Atenciosamente,
                Portal Universitário
                """.formatted(username, resetUrl));
    }

    private void send(String toEmail, String subject, String body) {
        sesClient.sendEmail(SendEmailRequest.builder()
                .source(fromEmail)
                .destination(Destination.builder().toAddresses(toEmail).build())
                .message(Message.builder()
                        .subject(Content.builder().data(subject).build())
                        .body(Body.builder()
                                .text(Content.builder().data(body).build())
                                .build())
                        .build())
                .build());
    }
}
