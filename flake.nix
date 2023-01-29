{
  description = "A very basic flake";

  outputs = { self, nixpkgs }: let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages."${system}";
  in {
    devShells."${system}".default = pkgs.mkShell {
        packages = with pkgs; [
            nodePackages.npm
            nodejs
            asciinema
        ];

        shellHook = ''
            export PATH=$PWD/.node_modules/bin:$PATH
        '';
    };
  };
}
