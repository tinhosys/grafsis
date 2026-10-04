$content = [System.IO.File]::ReadAllText("c:\Users\ADM\Documents\GRAFSIS\js\sales.js", [System.Text.Encoding]::UTF8)

$oldUpload = '(?s)handleArteUpload\(input\) \{.*?saveOrder\(e, id, geradoNumero\) \{'

$newUpload = @'
  handleArteUpload(input) {
    if(!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (file.size > 1.5 * 1024 * 1024) {
      alert("A imagem da arte deve ter no máximo 1.5MB.");
      input.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      document.querySelector('input[name="foto_arte_url"]').value = "Imagem salva no banco de dados";
      document.getElementById('order-arte-url').value = e.target.result;
      alert("Imagem da arte anexada com sucesso e pronta para salvar!");
    };
    reader.readAsDataURL(file);
  },
  saveOrder(e, id, geradoNumero) {
'@

$content = [System.Text.RegularExpressions.Regex]::Replace($content, $oldUpload, $newUpload)

[System.IO.File]::WriteAllText("c:\Users\ADM\Documents\GRAFSIS\js\sales.js", $content, [System.Text.Encoding]::UTF8)
