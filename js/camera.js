const botaoIniciarCamera = document.querySelector("[data-video-botao]");
const campoCamera = document.querySelector("[data-camera]");
const video = document.querySelector("[data-video]");
const tirarFoto = document.querySelector("[data-tirar-foto]");
const canvas = document.querySelector("[data-video-canvas]");
const mensagem = document.querySelector("[data-mensagem]");
const botaoEnviarFoto = document.querySelector("[data-enviar]");
const statusCamera = document.getElementById("status-camera");
let stream;
let solicitando = false;
let ativa = true;
let capturada = false;
function pararCamera() {
  stream?.getTracks().forEach(track => track.stop());
  video.srcObject = null;
  stream = undefined;
}
botaoIniciarCamera.addEventListener("click", async () => {
  if (solicitando || stream) return;
  if (!navigator.mediaDevices?.getUserMedia) {
    statusCamera.textContent = "Câmera indisponível. Use HTTPS ou localhost em um navegador compatível.";
    return;
  }
  solicitando = true;
  botaoIniciarCamera.disabled = true;
  try {
    const novaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    if (!ativa) { novaStream.getTracks().forEach(track => track.stop()); return; }
    stream = novaStream;
    video.srcObject = stream;
    botaoIniciarCamera.style.display = "none";
    campoCamera.style.display = "block";
    statusCamera.textContent = "Câmera ativa. A imagem ficará apenas nesta página.";
  } catch {
    statusCamera.textContent = "Não foi possível acessar a câmera. Confira a permissão e tente novamente.";
  } finally { solicitando = false; botaoIniciarCamera.disabled = false; }
});
tirarFoto.addEventListener("click", () => {
  if (!stream || !video.videoWidth) { statusCamera.textContent = "Aguarde a câmera ficar pronta."; return; }
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  capturada = true;
  pararCamera();
  campoCamera.style.display = "none";
  mensagem.style.display = "block";
  statusCamera.textContent = "Prévia capturada. A câmera foi desligada; nenhuma foto será enviada ou salva.";
});
botaoEnviarFoto.addEventListener("click", evento => {
  evento.preventDefault();
  if (!capturada) return;
  pararCamera();
  window.location.href = "./abrir-conta-form-3.html";
});
window.addEventListener("pagehide", () => { ativa = false; pararCamera(); });
window.addEventListener("pageshow", () => { ativa = true; });
