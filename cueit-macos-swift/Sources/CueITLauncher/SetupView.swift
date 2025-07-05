import SwiftUI

struct SetupView: View {
    @ObservedObject var model: LauncherModel

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
            Text("Environment Setup").font(.headline)
            ForEach(Array(model.envs.keys), id: .self) { key in
                VStack(alignment: .leading) {
                    Text(key).bold()
                    TextEditor(text: Binding(
                        get: { model.envs[key] ?? "" },
                        set: { model.envs[key] = $0 }
                    ))
                    .font(.system(.body, design: .monospaced))
                    .frame(height: 120)
                }
            }
            Button("Save") { model.saveEnvs() }
        }
        .padding(Theme.Spacing.md)
        .frame(width: 500, height: 400)
    }
}

struct SetupView_Previews: PreviewProvider {
    static var previews: some View {
        SetupView(model: LauncherModel())
    }
}
